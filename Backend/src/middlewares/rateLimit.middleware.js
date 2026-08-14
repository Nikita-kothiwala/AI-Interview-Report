import rateLimit from "express-rate-limit";

export const verifyEmailLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    limit: 10,

    standardHeaders: "draft-8",
    legacyHeaders: false,

    message: {
        message: "Too many verification attempts. Please try again later."
    }
});


export const resendOTPLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 3,

    standardHeaders: "draft-8",
    legacyHeaders: false,

    message: {
        message: "Too many OTP requests. Please try again later."
    }
});

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,

    standardHeaders: "draft-8",
    legacyHeaders: false,

    message: {
        message: "Too many login attempts. Please try again later."
    }
});