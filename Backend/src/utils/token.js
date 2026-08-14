import crypto from "crypto";
import jwt from "jsonwebtoken";

export function generateRefreshToken() {
    return crypto.randomBytes(64).toString("hex");
}

export function hashRefreshToken(token) {
    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
}

export function generateTokenFamily() {
    return crypto.randomUUID();
}

export function generateAccessToken(user) {
    return jwt.sign(
        {
            sub: user._id.toString(),
            username: user.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: "15m",
            issuer: "ai-interview-api",
            audience: "ai-interview-client"
        }
    );
}