import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in environment variables");
}

export type SessionJwtPayload = {
    sub: string; // user ID
    email: string;
    name?: string | null;
}

export function signSession(payload: SessionJwtPayload){
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '2m' });
}

export function verifySession(token: string){
    return jwt.verify(token, JWT_SECRET) as SessionJwtPayload;
}