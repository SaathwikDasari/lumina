import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET missing in .env");

const ttlMinutes = Number(process.env.ACCESS_TOKEN_TTL_MINUTES || "15");

export function signAccessToken(userId: string) {
    return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: `${ttlMinutes}m` });
}

export function verifyAccessToken(token: string): { sub: string } {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    if (!payload?.sub) throw new Error("Invalid token payload");
    return { sub: String(payload.sub) };
}
