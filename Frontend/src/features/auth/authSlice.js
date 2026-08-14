import {
    createSlice
} from "@reduxjs/toolkit";

import {
    loginUser,
    logoutUser,
    registerUser,
    restoreSession
} from "./authThunks.js";


const initialState = {
    user: null,
    loading: false,
    initialized: false,
    error: null,
    pendingVerificationEmail: null
};


const authSlice = createSlice({

    name: "auth",

    initialState,

    reducers: {

        setUser: (state, action) => {
            state.user = action.payload;
        },

        clearAuth: (state) => {
            state.user = null;
            state.error = null;
        },

        clearError: (state) => {
            state.error = null;
        }
    },

    extraReducers: (builder) => {

        // =========================
        // LOGIN
        // =========================

        builder

            .addCase(
                loginUser.pending,
                (state) => {

                    state.loading = true;
                    state.error = null;
                }
            )

            .addCase(
                loginUser.fulfilled,
                (state, action) => {

                    state.loading = false;

                    state.user =
                        action.payload.user;

                    state.error = null;
                }
            )

            .addCase(
                loginUser.rejected,
                (state, action) => {

                    state.loading = false;

                    state.error =
                        action.payload;
                }
            );


        // =========================
        // REGISTER
        // =========================

        builder

            .addCase(
                registerUser.pending,
                (state) => {

                    state.loading = true;
                    state.error = null;
                }
            )

            .addCase(
                registerUser.fulfilled,
                (state) => {

                    state.loading = false;
                    state.error = null;
                }
            )

            .addCase(
                registerUser.rejected,
                (state, action) => {

                    state.loading = false;

                    state.error =
                        action.payload;
                }
            );


        // =========================
        // LOGOUT
        // =========================

        builder

            .addCase(
                logoutUser.pending,
                (state) => {

                    state.loading = true;
                }
            )

            .addCase(
                logoutUser.fulfilled,
                (state) => {

                    state.loading = false;
                    state.user = null;
                    state.error = null;
                }
            )

            .addCase(
                logoutUser.rejected,
                (state, action) => {

                    state.loading = false;
                    state.user = null;

                    state.error =
                        action.payload;
                }
            );


        // =========================
        // RESTORE SESSION
        // =========================

        builder

            .addCase(
                restoreSession.pending,
                (state) => {

                    state.loading = true;
                    state.initialized = false;
                }
            )

            .addCase(
                restoreSession.fulfilled,
                (state, action) => {

                    state.loading = false;

                    state.user =
                        action.payload;

                    state.initialized = true;

                    state.error = null;
                }
            )

            .addCase(
                restoreSession.rejected,
                (state) => {

                    state.loading = false;

                    state.user = null;

                    state.initialized = true;

                    state.error = null;
                }
            );
    }
});


export const {
    setUser,
    clearAuth,
    clearError
} = authSlice.actions;


export default authSlice.reducer;