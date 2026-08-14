import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",

    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});



export async function sendVerificationEmail(email, otp) {
    await transporter.sendMail({
        from: `"AI Interview" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Verify your email - AI Interview",

        text: `Your email verification OTP is ${otp}. It expires in 10 minutes.`,

        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
                <h2>Verify your email</h2>

                <p>
                    Thank you for registering with AI Interview.
                </p>

                <p>
                    Your email verification code is:
                </p>

                <div style="
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: 8px;
                    margin: 20px 0;
                ">
                    ${otp}
                </div>

                <p>
                    This OTP will expire in <strong>10 minutes</strong>.
                </p>

                <p>
                    If you did not create this account, you can safely ignore this email.
                </p>
            </div>
        `
    });
}