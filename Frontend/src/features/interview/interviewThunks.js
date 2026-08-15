import { createAsyncThunk } from "@reduxjs/toolkit";

import {
    generateInterviewReport,
    getAllInterviewReports,
    getAllInterviewReportsById,
    generateResumePdf
} from "./services/interview.ai.js";


// =====================================
// GENERATE INTERVIEW REPORT
// =====================================

export const generateReport = createAsyncThunk(

    "interview/generateReport",

    async (
        {
            jobDescription,
            selfDescription,
            resumeFile
        },
        { rejectWithValue }
    ) => {

        try {

            const data =
                await generateInterviewReport({
                    jobDescription,
                    selfDescription,
                    resumeFile
                });

            return data.interviewReport;

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Failed to generate interview report."
            );
        }
    }
);


// =====================================
// GET ALL REPORTS
// =====================================

export const getReports = createAsyncThunk(

    "interview/getReports",

    async (_, { rejectWithValue }) => {

        try {

            const data =
                await getAllInterviewReports();

            return data.interviewReports;

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Failed to fetch interview reports."
            );
        }
    }
);


// =====================================
// GET REPORT BY ID
// =====================================

export const getReportById = createAsyncThunk(

    "interview/getReportById",

    async (
        interviewId,
        { rejectWithValue }
    ) => {

        try {

            const data =
                await getAllInterviewReportsById(
                    interviewId
                );

            return data.interviewReport;

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Failed to fetch interview report."
            );
        }
    }
);


// =====================================
// DOWNLOAD RESUME
// =====================================

export const downloadResume = createAsyncThunk(

    "interview/downloadResume",

    async (
        interviewReportId,
        { rejectWithValue }
    ) => {

        try {

            const response =
                await generateResumePdf({
                    interviewReportId
                });

            const url =
                window.URL.createObjectURL(
                    new Blob(
                        [response],
                        {
                            type: "application/pdf"
                        }
                    )
                );

            const link =
                document.createElement("a");

            link.href = url;

            link.setAttribute(
                "download",
                `resume_${interviewReportId}.pdf`
            );

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(url);

            return true;

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Failed to download resume."
            );
        }
    }
);