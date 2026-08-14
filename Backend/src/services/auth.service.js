import crypto from "crypto";
import refreshTokenModel from "../models/refreshToken.model.js";
import {
    generateAccessToken,
    generateRefreshToken,
    hashRefreshToken,
    generateTokenFamily
} from "../utils/token.js";

export async function createAuthSession(
    user,
    req
) {
    const accessToken = generateAccessToken(user);

    const refreshToken = generateRefreshToken();

    const tokenHash = hashRefreshToken(
        refreshToken
    );

    const tokenFamily = generateTokenFamily();

    const expiresAt = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    await refreshTokenModel.create({
        userId: user._id,
        tokenHash,
        tokenFamily,
        expiresAt,
        createdByIp: req.ip,
        userAgent: req.get("user-agent")
    });

    return {
        accessToken,
        refreshToken
    };
}