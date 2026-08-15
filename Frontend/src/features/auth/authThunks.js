import {
    createAsyncThunk
} from "@reduxjs/toolkit";

import { login, register, logout, refreshToken, getMe} from "./services/auth.api.js";
import {setAccessToken,clearAccessToken} from "./services/api.js";


export const loginUser = createAsyncThunk(
    "auth/login",

    async (
        { email, password },
        { rejectWithValue }
    ) => {

        try {

            const data = await login({
                email,
                password
            });

            setAccessToken(
                data.accessToken
            );

            return data;

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Login failed"
            );
        }
    }
);


export const logoutUser = createAsyncThunk(
    "auth/logout",

    async (_, { rejectWithValue }) => {

        try {

            await logout();

            clearAccessToken();

            return true;

        } catch (error) {

            clearAccessToken();

            return rejectWithValue(
                error.response?.data?.message ||
                "Logout failed"
            );
        }
    }
);


export const restoreSession = createAsyncThunk(
    "auth/restoreSession",

    async (_, { rejectWithValue }) => {

        try {

            const tokenData =
                await refreshToken();

            setAccessToken(
                tokenData.accessToken
            );

            const userData =
                await getMe();

            return userData.user;

        } catch (error) {

            clearAccessToken();

            return rejectWithValue(
                "No active session"
            );
        }
    }
);


export const registerUser = createAsyncThunk(
    "auth/register",

    async (
        { username, email, password },
        { rejectWithValue }
    ) => {

        try {

            const data = await register({
                username,
                email,
                password
            });

            return data;

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Registration failed"
            );
        }
    }
);