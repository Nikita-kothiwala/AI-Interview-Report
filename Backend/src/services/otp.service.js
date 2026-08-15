import otpModel from "../models/otp.model.js";
import { createOTP, hashOTP } from "../utils/otp.js";
import { sendVerificationEmail } from "./email.service.js";

export async function createAndSendVerificationOTP(user) {

    // Remove any previous OTPs for this user
    await otpModel.deleteMany({
        userId: user._id,
        consumedAt: null
    });

    const otp = generateOTP();

    const otpHash = hashOTP(otp);

    const expiresAt = new Date(
        Date.now() + 10 * 60 * 1000
    );

    await otpModel.create({
        userId: user._id,
        otpHash,
        expiresAt,
        attempts: 0,
        consumedAt: null
    });

    try {
        await sendVerificationEmail(
            user.email,
            otp
        );
    } catch (error) {

        // If email failed, remove the OTP
        await otpModel.deleteMany({
            userId: user._id,
            consumedAt: null
        });

        throw error;
    }
}