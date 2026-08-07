import express from "express"
import { authUser } from "../middlewares/auth.middleware.js"
import InterviewController from "../controller/interview.controller.js"
import upload from "../middlewares/file.middleware.js"
const interviewRouter = express.Router()


/**
 * @route POST api/interview/
 * @description generate new interview report on the basis of user self description , resume pdf and job description
 * @access private
 */

interviewRouter.post("/", authUser,upload.single("resume"), InterviewController.generateInterviewReportController)


/**
 * @route GET api/interview/:interviewid
 * @description get interview report by interviewid
 * @access private
 */

interviewRouter.get("/report/:interviewId", authUser, InterviewController.getInterviewByIdController)


/**
 * @route GET /api/interview/
 * @description get all interview reports of logged in user
 * @access private
 */

interviewRouter.get("/" , authUser, InterviewController.getAllInterviewReportController)

/**
 * @route GET api/interview/resume/pdf
 * @description Generate resume pdf on the basis of user details
 * @access private
 */

interviewRouter.post("/resume/pdf/:interviewReportId", authUser, InterviewController.generateResumePdfController)

export default interviewRouter