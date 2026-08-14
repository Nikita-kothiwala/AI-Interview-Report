import userModel from "../models/user.model.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import cookieParser from "cookie-parser"
import blacklistModel from "../models/blacklist.model.js"
import otpModel from "../models/otp.model.js";
import { generateOTP, hashOTP } from "../utils/otp.js";
import { sendVerificationEmail } from "../services/email.service.js";
import { createAndSendVerificationOTP } from "../services/otp.service.js";
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
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const isUserExist = await userModel.findOne({ email });

    if (!isUserExist) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, isUserExist.password);

    if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({
        id: isUserExist._id,
        username: isUserExist.username,
    }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });

    res.cookie("token", token);

    res.status(200).json({
        message: "User logged in successfully",
        user: {
            id: isUserExist._id,
            username: isUserExist.username,
            email: isUserExist.email
        }
    });

}

/**
 * @name logoutUser
 * @description Logout a user
 * @route POST /api/auth/logout
 * @access Public
 */
async function logoutUser(req, res) {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(400).json({ message: "No token found" });
        }

        if (token) {
            await blacklistModel.create({ token });
        }

        res.clearCookie("token");
        res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        console.error("Error logging out user:", error);
        res.status(500).json({ message: "Internal server error" });
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

export default { registerUser, loginUser, logoutUser, getMe, verifyEmail, resendOTP };