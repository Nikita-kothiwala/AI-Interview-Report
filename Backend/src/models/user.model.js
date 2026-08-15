import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            trim: true
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: [true, "Password is required"],
            select: false
        },

        emailVerified: {
            type: Boolean,
            default: false
        },

        isActive: {
            type: Boolean,
            default: true
        },

        lastLoginAt: {
            type: Date,
            default: null
        },
        passwordResetOTPHash: {
            type: String,
            default: null
        },

        passwordResetOTPExpiresAt: {
            type: Date,
            default: null
        },

        passwordResetOTPAttempts: {
            type: Number,
            default: 0
        },

        passwordResetOTPLastSentAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

const userModel = mongoose.model("Users", userSchema);

export default userModel;