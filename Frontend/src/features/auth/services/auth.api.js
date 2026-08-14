import api from "./api.js";

export async function register({
    username,
    email,
    password
}) {

    const response = await api.post(
        "/api/auth/register",
        {
            username,
            email,
            password
        }
    );

    return response.data;
}

export async function login({
    email,
    password
}) {

    const response = await api.post(
        "/api/auth/login",
        {
            email,
            password
        }
    );

    return response.data;
}

export async function logout() {

    const response = await api.post(
        "/api/auth/logout"
    );

    return response.data;
}

export async function getMe() {

    const response = await api.get(
        "/api/auth/get-me"
    );

    return response.data;
}

export async function refreshToken() {

    const response = await api.post(
        "/api/auth/refresh"
    );

    return response.data;
}

export async function verifyEmail({ email, otp }) {
    try {
        const response = await api.post(
            "/api/auth/verify-email",
            {
                email,
                otp
            }
        );

        return response.data;

    } catch (error) {
        console.error(
            "Email verification error:",
            error.response?.data || error.message
        );

        throw error;
    }
}

export async function resendOTP({ email }) {
    try {

        const response = await api.post(
            "/api/auth/resend-otp",
            {
                email
            }
        );

        return response.data;

    } catch (error) {

        console.error(
            "Resend OTP error:",
            error.response?.data || error.message
        );

        throw error;
    }
}