import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";

export type AuthedRequest = Request & { userId?: string };

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "missing bearer token" });
    }

    const token = auth.slice("Bearer ".length).trim();

    try {
    const { sub } = verifyAccessToken(token);
    req.userId = sub;
    return next();
    } catch {
    return res.status(401).json({ error: "invalid or expired token" });
    }
}
