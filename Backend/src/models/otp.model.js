import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
            required: true,
            index: true
        },

        otpHash: {
            type: String,
            required: true
        },

        expiresAt: {
            type: Date,
            required: true,
            index: true
        },

        attempts: {
            type: Number,
            default: 0,
            min: 0
        },

        consumedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

otpSchema.index(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
);

const otpModel = mongoose.model(
    "EmailVerificationOTP",
    otpSchema
);

export default otpModel;