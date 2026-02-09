import { Router } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { pool } from "../db/pool";
import { signAccessToken } from "../utils/jwt";

const router = Router();

const refreshDays = Number(process.env.REFRESH_TOKEN_TTL_DAYS || "7");
const cookieSecure = String(process.env.COOKIE_SECURE || "false") === "true";

function sha256Hex(s: string) {
    return crypto.createHash("sha256").update(s).digest("hex");
}

function newRefreshToken() {
    return crypto.randomBytes(48).toString("hex");
}

function refreshExpiryDate() {
  return new Date(Date.now() + refreshDays * 24 * 60 * 60 * 1000);
}

// POST /auth/register
router.post("/register", async (req, res) => {
    try {
    const { email, password, name } = req.body as {
        email?: string;
        password?: string;
        name?: string;
    };

    if (!email || !password) {
        return res.status(400).json({ error: "email and password required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
        `insert into users (email, password_hash, name)
        values ($1, $2, $3)
        returning id, email, name, created_at`,
        [normalizedEmail, passwordHash, name?.trim() || null]
    );

    return res.status(201).json({ user: result.rows[0] });
    } catch (err: any) {
    if (err?.code === "23505") {
        return res.status(409).json({ error: "email already in use" });
    }
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ error: "internal server error" });
    }
});

// POST /auth/login
router.post("/login", async (req, res) => {
    try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
        return res.status(400).json({ error: "email and password required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const userRes = await pool.query(
        `select id, email, password_hash, name from users where email = $1`,
        [normalizedEmail]
    );

    const user = userRes.rows[0];
    if (!user) return res.status(401).json({ error: "invalid credentials" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "invalid credentials" });

    const accessToken = signAccessToken(user.id);

    const rt = newRefreshToken();
    const rtHash = sha256Hex(rt);
    const expiresAt = refreshExpiryDate();

    await pool.query(
        `insert into sessions (user_id, refresh_token_hash, user_agent, ip, expires_at)
        values ($1, $2, $3, $4, $5)`,
        [
        user.id,
        rtHash,
        req.get("user-agent") || null,
        req.ip || null,
        expiresAt,
        ]
    );

    res.cookie("refresh_token", rt, {
        httpOnly: true,
        secure: cookieSecure,
        sameSite: "lax",
        path: "/auth/refresh",
        expires: expiresAt,
    });

    return res.json({
        accessToken,
        user: { id: user.id, email: user.email, name: user.name },
    });
    } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ error: "internal server error" });
    }
});

// POST /auth/refresh (rotate)
router.post("/refresh", async (req, res) => {
    try {
    const rt = req.cookies?.refresh_token as string | undefined;
    if (!rt) return res.status(401).json({ error: "missing refresh token" });

    const rtHash = sha256Hex(rt);

    const sessRes = await pool.query(
        `select id, user_id, expires_at, revoked_at
        from sessions
        where refresh_token_hash = $1`,
        [rtHash]
    );

    const session = sessRes.rows[0];
    if (!session) return res.status(401).json({ error: "invalid refresh token" });
    if (session.revoked_at) return res.status(401).json({ error: "invalid refresh token" });
    if (new Date(session.expires_at) < new Date()) {
        return res.status(401).json({ error: "refresh token expired" });
    }

    // revoke old
    await pool.query(`update sessions set revoked_at = now() where id = $1`, [session.id]);

    // create new session
    const newRt = newRefreshToken();
    const newRtHash = sha256Hex(newRt);
    const newExpiresAt = refreshExpiryDate();

    await pool.query(
        `insert into sessions (user_id, refresh_token_hash, user_agent, ip, expires_at)
        values ($1, $2, $3, $4, $5)`,
        [
        session.user_id,
        newRtHash,
        req.get("user-agent") || null,
        req.ip || null,
        newExpiresAt,
        ]
    );

    // new access token
    const accessToken = signAccessToken(session.user_id);

    res.cookie("refresh_token", newRt, {
        httpOnly: true,
        secure: cookieSecure,
        sameSite: "lax",
        path: "/auth/refresh",
        expires: newExpiresAt,
    });

    return res.json({ accessToken });
    } catch (err) {
    console.error("REFRESH ERROR:", err);
    return res.status(500).json({ error: "internal server error" });
    }
});

// POST /auth/logout
router.post("/logout", async (req, res) => {
    try {
    const rt = req.cookies?.refresh_token as string | undefined;

    if (rt) {
        const rtHash = sha256Hex(rt);
        await pool.query(
        `update sessions set revoked_at = now()
            where refresh_token_hash = $1 and revoked_at is null`,
        [rtHash]
        );
    }

    // clear cookie (must match path)
    res.clearCookie("refresh_token", { path: "/auth/refresh" });

    return res.json({ ok: true });
    } catch (err) {
    console.error("LOGOUT ERROR:", err);
    return res.status(500).json({ error: "internal server error" });
    }
});

export default router;
