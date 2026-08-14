import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
            required: true,
            index: true
        },

        tokenHash: {
            type: String,
            required: true,
            unique: true
        },

        tokenFamily: {
            type: String,
            required: true,
            index: true
        },

        expiresAt: {
            type: Date,
            required: true,
            index: true
        },

        revokedAt: {
            type: Date,
            default: null
        },

        replacedByTokenHash: {
            type: String,
            default: null
        },

        createdByIp: {
            type: String,
            default: null
        },

        userAgent: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

refreshTokenSchema.index(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
);

const refreshTokenModel = mongoose.model(
    "RefreshToken",
    refreshTokenSchema
);

export default refreshTokenModel;