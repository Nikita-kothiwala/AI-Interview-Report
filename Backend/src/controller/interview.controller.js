import { PDFParse } from "pdf-parse";
 import GenerateReport from "../services/ai.service.js";
import interviewReportModel from "../models/interviewreport.model.js";


function normalizeInterviewReport(report) {

    // Rename Gemini keys to Mongo schema keys

    // report.matchScore = Number(
    //     String(report.match_score).replace("%", "")
    // ) || 0;


    // report.technicalQuestions =
    //     report.technical_interview_questions || [];


    // report.behaviourQuestions =
    //     report.behavioral_interview_questions || [];


    // report.skillGaps =
    //     report.skill_gaps || [];


    // report.preparationPlan =
    //     report.day_wise_preparation_plan || [];
    report.matchScore =
        Number(report.matchScore) || 0;

    report.technicalQuestions =
        report.technicalQuestions || [];

    report.behaviourQuestions =
        report.behaviourQuestions || [];

    report.skillGaps =
        report.skillGaps || [];

    report.preparationPlan =
        report.preparationPlan || [];



    // Normalize technical questions
    report.technicalQuestions =
        report.technicalQuestions.map((item) => {

            if (typeof item === "string") {

                return {
                    question: item,
                    intention: "To evaluate technical knowledge.",
                    answer: "Explain with practical examples and projects."
                };

            }

            return {
                question: item.question || "",
                intention: item.intention || "To evaluate technical knowledge.",
                answer: item.answer || "Provide a detailed explanation."
            };

        });



    // Normalize behavioural questions
    report.behaviourQuestions =
        report.behaviourQuestions.map((item) => {

            if (typeof item === "string") {

                return {
                    question: item,
                    intention: "To evaluate behavioral skills.",
                    answer: "Answer using STAR method with examples."
                };

            }

            return {
                question: item.question || "",
                intention: item.intention || "To evaluate technical knowledge.",
                answer: item.answer || "Provide a detailed explanation."
            };

        });



    // Normalize skill gaps
    report.skillGaps =
        report.skillGaps.map((item) => {

            if (typeof item === "string") {

                return {
                    skills: item,
                    severity: "medium"
                };

            }

            return item;

        });



    // Normalize preparation plan
    report.preparationPlan =
        report.preparationPlan.map((item, index) => {

            if (typeof item === "string") {

                return {
                    day: index + 1,
                    focus: item,
                    tasks: [
                        "Study the topic",
                        "Practice questions",
                        "Build examples"
                    ]
                };

            }

            return item;

        });



    return report;
}



async function generateInterviewReportController(req, res) {

    try {

        if (!req.file) {
            return res.status(400).json({
                message: "Resume PDF is required."
            });
        }


        const { selfDescription, jobDescription } = req.body;


        // Extract text from PDF
        const pdfData = await (
            new PDFParse(
                Uint8Array.from(req.file.buffer)
            )
        ).getText();


        const resumeContent = pdfData.text;


        // Generate AI report
        let interviewReportByAi = await GenerateReport.generateInterviewReport({
            resume: resumeContent,
            selfDescription,
            jobDescription
        });


        console.log(
            "BEFORE NORMALIZATION:",
            JSON.stringify(interviewReportByAi, null, 2)
        );


        // Normalize Gemini response
        interviewReportByAi = normalizeInterviewReport(interviewReportByAi);


        console.log(
            "AFTER NORMALIZATION:",
            JSON.stringify(interviewReportByAi, null, 2)
        );


        // Save report
        const interviewReport = await interviewReportModel.create({
            user: req.user._id,
            resume: resumeContent,
            selfDescription,
            jobDescription,
            ...interviewReportByAi
        });


        return res.status(200).json({
            message: "Interview Report Generated Successfully",
            interviewReport
        });


    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Failed to generate interview report",
            error: error.message
        });
    }
}

/**
 * @description Controller to get interview report by interviewId
 */
async function getInterviewByIdController(req, res) {

    const { interviewId } = req.params

    const interviewReport = await interviewReportModel.findOne({
        id: interviewId,
        user: req.user.id
    })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview Report not found"
        })
    }

    res.status(200).json({
        message: "Interview Report Fetched Successfully",
        interviewReport
    })

}


async function getAllInterviewReportController(req, res) {

    const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behaviourQuestions -skillGaps -preparationPlan")

    res.status(200).json({
        message: "Interview Reports Fetched Successfully",
        interviewReports
    })

}

/**
 * @description Controller to generate resume PDF based on user self Description, Job Description and resume 
 */

async function generateResumePdfController(req, res) {
    const {interviewReportId} = req.params

    const interviewReport = await interviewReportModel.findById(interviewReportId)

    if(!interviewReport){
        return res.status(404).json({
            message: "Interview Report not found !"
        })
    }


    const {resume, selfDescription, jobDescription} = interviewReport
    const pdfBuffer = await GenerateReport.generateResumePdf({resume, selfDescription, jobDescription})

    res.set({
        "Content-Type" : "application/pdf",
        "Content-Disposition" :`attachment: filename=resume_${interviewReportId}.pdf`
    })

    res.send(pdfBuffer)
}



export default {
    generateInterviewReportController, getInterviewByIdController, getAllInterviewReportController, generateResumePdfController
};