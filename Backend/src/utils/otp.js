import crypto from "crypto";

export function createOTP() {
    const otp = crypto.randomInt(100000, 1000000).toString();

    const otpHash = crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");

    const otpExpiresAt = new Date(
        Date.now() + 10 * 60 * 1000
    );

    return {
        otp,
        otpHash,
        otpExpiresAt
    };
}

export function hashOTP(otp) {
    return crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");
}