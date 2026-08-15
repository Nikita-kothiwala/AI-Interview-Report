import { createSlice } from "@reduxjs/toolkit";

import {
    generateReport,
    getReports,
    getReportById,
    downloadResume
} from "./interviewThunks.js";


const initialState = {

    // Single selected report
    report: null,

    // All reports
    reports: [],

    // Loading states
    loading: false,

    // Error
    error: null
};


const interviewSlice = createSlice({

    name: "interview",

    initialState,

    reducers: {

        clearInterviewError: (state) => {
            state.error = null;
        },

        clearReport: (state) => {
            state.report = null;
        },

        clearReports: (state) => {
            state.reports = [];
        }
    },


    extraReducers: (builder) => {

       
        // GENERATE REPORT
   

        builder

            .addCase(
                generateReport.pending,
                (state) => {

                    state.loading = true;
                    state.error = null;
                }
            )

            .addCase(
                generateReport.fulfilled,
                (state, action) => {

                    state.loading = false;

                    state.report =
                        action.payload;

                    state.error = null;
                }
            )

            .addCase(
                generateReport.rejected,
                (state, action) => {

                    state.loading = false;

                    state.error =
                        action.payload;
                }
            );


        // GET ALL REPORTS
       

        builder

            .addCase(
                getReports.pending,
                (state) => {

                    state.loading = true;
                    state.error = null;
                }
            )

            .addCase(
                getReports.fulfilled,
                (state, action) => {

                    state.loading = false;

                    state.reports =
                        action.payload;

                    state.error = null;
                }
            )

            .addCase(
                getReports.rejected,
                (state, action) => {

                    state.loading = false;

                    state.error =
                        action.payload;
                }
            );


      
        builder

            .addCase(
                getReportById.pending,
                (state) => {

                    state.loading = true;
                    state.error = null;
                    state.report = null;
                }
            )

            .addCase(
                getReportById.fulfilled,
                (state, action) => {

                    state.loading = false;

                    state.report =
                        action.payload;

                    state.error = null;
                }
            )

            .addCase(
                getReportById.rejected,
                (state, action) => {

                    state.loading = false;

                    state.report = null;

                    state.error =
                        action.payload;
                }
            );


        // =====================================
        // DOWNLOAD RESUME
        // =====================================

        builder

            .addCase(
                downloadResume.pending,
                (state) => {

                    state.loading = true;
                    state.error = null;
                }
            )

            .addCase(
                downloadResume.fulfilled,
                (state) => {

                    state.loading = false;
                    state.error = null;
                }
            )

            .addCase(
                downloadResume.rejected,
                (state, action) => {

                    state.loading = false;

                    state.error =
                        action.payload;
                }
            );
    }
});


export const {
    clearInterviewError,
    clearReport,
    clearReports
} = interviewSlice.actions;


export default interviewSlice.reducer;