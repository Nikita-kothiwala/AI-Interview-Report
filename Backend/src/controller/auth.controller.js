import userModel from "../models/user.model.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import cookieParser from "cookie-parser"
import blacklistModel from "../models/blacklist.model.js"
import otpModel from "../models/otp.model.js";
import {createOTP,hashOTP} from "../utils/otp.js";
import { sendVerificationEmail, sendPasswordResetOTP } from "../services/email.service.js";
import { createAndSendVerificationOTP } from "../services/otp.service.js";
import { createAuthSession } from "../services/auth.service.js";
import { refreshCookieOptions } from "../config/cookie.config.js";
import refreshTokenModel from "../models/refreshToken.model.js";
import { generateAccessToken, generateRefreshToken, hashRefreshToken } from "../utils/token.js";


/**
 @name registerUser
 @description Register a new user , expects username, email, and password in the request body
 @route POST /api/auth/register
 @access Public
 */

//  async function registerUser(req, res) {
//     try {
//         const { username, email, password } = req.body;

//         if(!username || !email || !password){
//             return res.status(400).json({ message: "All fields are required" });
//         }

//         const isAlreadyExist = await userModel.findOne({ 
//             $or: [{ username }
//                 , { email }]
//              });


//         if (isAlreadyExist) {
//             return res.status(400).json({ message: "Username or email already exists" });
//         }

//         const passwordHash = await bcrypt.hash(password, 10);

//         const newUser = await userModel.create({
//             username,
//             email,
//             password: passwordHash
//         })

//         const token = jwt.sign({
//             id: newUser._id,
//             username: newUser.username,
//         },process.env.JWT_SECRET_KEY, { expiresIn: "1d" });

//     res.cookie("token", token)


//         res.status(201).json({ 
//             message: "User registered successfully",
//             user:{
//                 id: newUser._id,
//                 username: newUser.username,
//                 email: newUser.email
//             }

//          });
//     } catch (error) {
//         console.error("Error registering user:", error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// };

async function registerUser(req, res) {

    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const normalizedUsername = username.trim();

        const isAlreadyExist = await userModel.findOne({
            $or: [
                { username: normalizedUsername },
                { email: normalizedEmail }
            ]
        });

        if (isAlreadyExist) {
            return res.status(409).json({
                message: "Username or email already exists"
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const newUser = await userModel.create({
            username: normalizedUsername,
            email: normalizedEmail,
            password: passwordHash,
            emailVerified: false
        });

        // const otp = generateOTP();
        // const otpHash = hashOTP(otp);

        // const expiresAt = new Date(
        //     Date.now() + 10 * 60 * 1000
        // );

        // await otpModel.create({
        //     userId: newUser._id,
        //     otpHash,
        //     expiresAt
        // });

        try {
            await createAndSendVerificationOTP(newUser);
        } catch (emailError) {
            console.error(
                "Failed to send verification email:",
                emailError
            );

            await userModel.findByIdAndDelete(newUser._id);
            await otpModel.deleteMany({
                userId: newUser._id
            });

            return res.status(500).json({
                message: "Unable to send verification email"
            });
        }

        return res.status(201).json({
            message:
                "Registration successful. Please verify your email using the OTP sent to your email.",
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                emailVerified: newUser.emailVerified
            }
        });

    } catch (error) {
        console.error("Error registering user:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

/**
 * @name verifyEmail
 * @description Verify email of the registered user 
 * @route POST /api/auth/verifyEmail
 * @access public
 */

async function verifyEmail(req, res) {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await userModel.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid verification request"
            });
        }

        if (user.emailVerified) {
            return res.status(400).json({
                message: "Email is already verified"
            });
        }

        const otpRecord = await otpModel
            .findOne({
                userId: user._id,
                consumedAt: null
            })
            .sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(400).json({
                message: "OTP not found or already used"
            });
        }

        if (otpRecord.expiresAt < new Date()) {
            return res.status(400).json({
                message: "OTP has expired"
            });
        }

        if (otpRecord.attempts >= 5) {
            return res.status(429).json({
                message: "Too many incorrect attempts. Please request a new OTP."
            });
        }

        const enteredOTPHash = hashOTP(otp);

        if (enteredOTPHash !== otpRecord.otpHash) {

            await otpModel.updateOne(
                {
                    _id: otpRecord._id,
                    attempts: { $lt: 5 }
                },
                {
                    $inc: { attempts: 1 }
                }
            );

            return res.status(400).json({
                message: "Invalid OTP"
            });
        }


        const consumedOTP = await otpModel.findOneAndUpdate(
            {
                _id: otpRecord._id,
                consumedAt: null
            },
            {
                $set: {
                    consumedAt: new Date()
                }
            },
            {
                new: true
            }
        );

        if (!consumedOTP) {
            return res.status(400).json({
                message: "OTP has already been used"
            });
        }

        user.emailVerified = true;

        await user.save();

        otpRecord.consumedAt = new Date();
        await otpRecord.save();

        user.emailVerified = true;
        await user.save();

        return res.status(200).json({
            message: "Email verified successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                emailVerified: user.emailVerified
            }
        });

    } catch (error) {
        console.error("Error verifying email:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


/**
 * @name resendOTP
 * @description To resend otp
 * @route POST /api/auth/resend-otp
 */
async function resendOTP(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const normalizedEmail = email
            .trim()
            .toLowerCase();

        const user = await userModel.findOne({
            email: normalizedEmail
        });

        /*
         * Don't reveal whether an email exists.
         */
        if (!user) {
            return res.status(200).json({
                message:
                    "If an account exists with this email, a new OTP has been sent."
            });
        }

        if (user.emailVerified) {
            return res.status(400).json({
                message: "Email is already verified"
            });
        }

        await createAndSendVerificationOTP(user);

        return res.status(200).json({
            message:
                "If an account exists with this email, a new OTP has been sent."
        });

    } catch (error) {

        console.error(
            "Error resending OTP:",
            error
        );

        return res.status(500).json({
            message: "Unable to resend OTP"
        });
    }
}

/**
 * @name loginUser
 * @description Login a user, expects email and password in the request body
 * @route POST /api/auth/login
 * @access Public
 */

async function loginUser(req, res) {
    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const normalizedEmail = email
            .trim()
            .toLowerCase();

        const user = await userModel
            .findOne({
                email: normalizedEmail
            })
            .select("+password");

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                message: "Your account has been disabled"
            });
        }

        if (!user.emailVerified) {
            return res.status(403).json({
                message:
                    "Please verify your email before logging in"
            });
        }

        const isPasswordValid =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        user.lastLoginAt = new Date();

        await user.save();

        const {
            accessToken,
            refreshToken
        } = await createAuthSession(
            user,
            req
        );

        res.cookie(
            "refreshToken",
            refreshToken,
            refreshCookieOptions
        );

        return res.status(200).json({
            message: "Login successful",

            accessToken,

            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                emailVerified: user.emailVerified
            }
        });

    } catch (error) {

        console.error(
            "Error logging in user:",
            error
        );

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


/**
 * @name refreshToken
 * @description Refresh a token
 * @route POST /api/auth/refresh-token
 * @access Public
 */

async function refreshAccessToken(req, res) {
    try {

        const refreshToken =
            req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                message: "Refresh token not found"
            });
        }

        const tokenHash =
            hashRefreshToken(refreshToken);

        const storedToken =
            await refreshTokenModel.findOne({
                tokenHash
            });

        if (!storedToken) {
            return res.status(401).json({
                message: "Invalid refresh token"
            });
        }

        if (storedToken.revokedAt) {

            // Reuse detection
            await refreshTokenModel.updateMany(
                {
                    tokenFamily:
                        storedToken.tokenFamily,
                    revokedAt: null
                },
                {
                    $set: {
                        revokedAt: new Date()
                    }
                }
            );

            res.clearCookie(
                "refreshToken",
                refreshCookieOptions
            );

            return res.status(401).json({
                message:
                    "Refresh token reuse detected. Please login again."
            });
        }

        if (
            storedToken.expiresAt < new Date()
        ) {

            return res.status(401).json({
                message:
                    "Refresh token has expired"
            });
        }

        const user =
            await userModel.findById(
                storedToken.userId
            );

        if (!user || !user.isActive) {

            return res.status(401).json({
                message:
                    "User account is not available"
            });
        }

        const newAccessToken =
            generateAccessToken(user);

        const newRefreshToken =
            generateRefreshToken();

        const newRefreshTokenHash =
            hashRefreshToken(
                newRefreshToken
            );

        const newExpiresAt = new Date(
            Date.now() +
            7 * 24 * 60 * 60 * 1000
        );

        await refreshTokenModel.create({
            userId: user._id,

            tokenHash:
                newRefreshTokenHash,

            tokenFamily:
                storedToken.tokenFamily,

            expiresAt:
                newExpiresAt,

            createdByIp: req.ip,

            userAgent:
                req.get("user-agent")
        });

        storedToken.revokedAt =
            new Date();

        storedToken.replacedByTokenHash =
            newRefreshTokenHash;

        await storedToken.save();

        res.cookie(
            "refreshToken",
            newRefreshToken,
            refreshCookieOptions
        );

        return res.status(200).json({
            accessToken:
                newAccessToken
        });

    } catch (error) {

        console.error(
            "Refresh token error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to refresh access token"
        });
    }
}



/**
 * @name logoutUser
 * @description Logout a user
 * @route POST /api/auth/logout
 * @access Public
 */
async function logoutUser(req, res) {
    try {

        const refreshToken =
            req.cookies.refreshToken;

        if (refreshToken) {

            const tokenHash =
                hashRefreshToken(
                    refreshToken
                );

            await refreshTokenModel.updateOne(
                {
                    tokenHash,
                    revokedAt: null
                },
                {
                    $set: {
                        revokedAt: new Date()
                    }
                }
            );
        }

        res.clearCookie(
            "refreshToken",
            refreshCookieOptions
        );

        return res.status(200).json({
            message:
                "User logged out successfully"
        });

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


/**
 * @name getMe
 * @description Get the current logged in user details
 * @route GET /api/auth/get-me
 */

async function getMe(req, res) {
    try {
        const user = await userModel.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "User details fetched successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}


/**
 * @name ForgotPassword
 * @description forgot password
 * @route POST /api/auth/forgot-password
 */
async function forgotPassword(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const normalizedEmail =
            email.trim().toLowerCase();

        const user = await userModel.findOne({
            email: normalizedEmail
        });

        // Prevent account enumeration
        if (!user) {
            return res.status(200).json({
                message:
                    "If an account exists with this email, a password reset OTP has been sent."
            });
        }

        const {
            otp,
            otpHash,
            otpExpiresAt
        } = createOTP();

        user.passwordResetOTPHash =
            otpHash;

        user.passwordResetOTPExpiresAt =
            otpExpiresAt;

        user.passwordResetOTPAttempts =
            0;

        user.passwordResetOTPLastSentAt =
            new Date();

        await user.save();

        await sendPasswordResetOTP(
            user.email,
            otp
        );

        return res.status(200).json({
            message:
                "If an account exists with this email, a password reset OTP has been sent."
        });

    } catch (error) {
        console.error(
            "Forgot password error:",
            error
        );

        return res.status(500).json({
            message:
                "Internal server error"
        });
    }
}

/**
 * @name ResetPassword
 * @description Resetting password
 * @route POST /api/auth/reset-password
 */
async function resetPassword(req, res) {
    try {
        const {
            email,
            otp,
            newPassword
        } = req.body;

        if (
            !email ||
            !otp ||
            !newPassword
        ) {
            return res.status(400).json({
                message:
                    "Email, OTP and new password are required"
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                message:
                    "Password must be at least 8 characters long"
            });
        }

        const normalizedEmail =
            email.trim().toLowerCase();

        const user =
            await userModel
                .findOne({
                    email: normalizedEmail
                })
                .select("+password");

        if (!user) {
            return res.status(400).json({
                message:
                    "Invalid password reset request"
            });
        }

        if (
            user.passwordResetOTPAttempts >= 5
        ) {
            return res.status(429).json({
                message:
                    "Too many incorrect attempts. Please request a new OTP."
            });
        }

        if (
            !user.passwordResetOTPHash ||
            !user.passwordResetOTPExpiresAt
        ) {
            return res.status(400).json({
                message:
                    "No password reset OTP found. Please request a new OTP."
            });
        }

        if (
            user.passwordResetOTPExpiresAt <
            new Date()
        ) {
            return res.status(400).json({
                message:
                    "OTP has expired. Please request a new OTP."
            });
        }

        const submittedOTPHash =
            hashOTP(otp);

        if (
            submittedOTPHash !==
            user.passwordResetOTPHash
        ) {
            user.passwordResetOTPAttempts += 1;

            await user.save();

            return res.status(400).json({
                message:
                    "Invalid OTP"
            });
        }

        const passwordHash =
            await bcrypt.hash(
                newPassword,
                12
            );

        user.password =
            passwordHash;

        user.passwordResetOTPHash =
            null;

        user.passwordResetOTPExpiresAt =
            null;

        user.passwordResetOTPAttempts =
            0;

        user.passwordResetOTPLastSentAt =
            null;

        await user.save();

        // Revoke existing refresh-token sessions here
        // using your existing refresh-token model/service.

        return res.status(200).json({
            message:
                "Password reset successfully. Please login again."
        });

    } catch (error) {
        console.error(
            "Reset password error:",
            error
        );

        return res.status(500).json({
            message:
                "Internal server error"
        });
    }
}

export default { registerUser, loginUser, logoutUser, getMe, verifyEmail, resendOTP, refreshAccessToken, forgotPassword, resetPassword };