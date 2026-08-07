import { GoogleGenAI } from "@google/genai";
import { z } from "zod"
import { zodToJsonSchema } from "zod-to-json-schema";
import puppeteer from "puppeteer"
import { Type } from "@google/genai";




const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})


const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate 's profile matches the job description."),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be ask in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover,what approach to take etc"),

    })).min(5).describe(
        "Generate at least 5 behavioral interview questions..."),
    behaviourQuestions: z.array(z.object({
        question: z.string().describe("The Behavioral question can be ask in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover,what approach to take etc"),

    })).min(5).describe("Behavioral Questions that can be asked in the interview along with their intentions and how to answer them."),
    skillGaps: z.array(z.object({
        skills: z.string().describe("The skills which the candidate is lacking"),
        severity: z.enum(["low", "medium", "high"]).describe("The severity of this skill gap")
    })).min(3).describe("List of skill gaps in the candidate profile along with there severity."),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structure, system design , mock interview etc"),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan ")
    })).min(5).describe("A day wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is genereated")
})






async function generateInterviewReport({ resume, selfDescription, jobDescription }) {

    const prompt = `You are an interview report generator.

You MUST return JSON ONLY.

Rules:

- Do not rename any field.
- Every field is mandatory.
- Never omit any field.
- technicalQuestions must contain exactly 5 objects.
- behaviourQuestions must contain exactly 5 objects.
- skillGaps must contain at least 3 objects.
- preparationPlan must contain exactly 7 objects.
- Every technical question object must contain:
  - question
  - intention
  - answer

- Every behavioural question object must contain:
  - question
  - intention
  - answer

- Every preparationPlan object must contain:
  - day
  - focus
  - tasks

- title is mandatory.

Return EXACTLY this JSON structure.

{
  "title": "",
  "matchScore": 0,
  "technicalQuestions": [
    {
      "question": "",
      "intention": "",
      "answer": ""
    }
  ],
  "behaviourQuestions": [
    {
      "question": "",
      "intention": "",
      "answer": ""
    }
  ],
  "skillGaps": [
    {
      "skills": "",
      "severity": "low"
    }
  ],
  "preparationPlan": [
    {
      "day": 1,
      "focus": "",
      "tasks": [
        "",
        ""
      ]
    }
  ]
}

Rules:
- matchScore must be an integer from 0-100.
- technicalQuestions must contain exactly 5 objects.
- behaviourQuestions must contain exactly 5 objects.
- skillGaps must contain exactly 3 objects.
- preparationPlan must contain exactly 7 objects.
- Never return strings like "question:" or "intention:".
- Each question must be an object.
- Return only JSON.

Candidate Resume:
${resume}

Candidate Self Description:
${selfDescription}

Job Description:
${jobDescription}

Return only valid JSON.

Return valid JSON only.
Do not wrap in markdown.
`


    const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(interviewReportSchema)
        }
    })


    return JSON.parse(response.text)
   

    

  
}




// async function generatePdfFromHtml(htmlContent) {
//     const browser = await puppeteer.launch()
//     const page = await browser.newPage()
//     await page.setContent(htmlContent, { waitUntil: "networkidle0" })

//     const pdfBuffer = await page.pdf({ format: "A4" })

//     await browser.close()
//     return pdfBuffer
// }

async function generatePdfFromHtml(htmlContent) {

    const browser = await puppeteer.launch({
        headless: "new",
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-gpu",
            "--disable-dev-shm-usage",
            "--disable-software-rasterizer"
        ]
    });

    const page = await browser.newPage();

    await page.setContent(htmlContent, {
        waitUntil: "networkidle0"
    });

    const pdfBuffer = await page.pdf({
        format: "A4",
        margin:{
            top:"20mm",
            bottom:"20mm",
            left : "15mm",
            right: "15mm"
        }
    });

    await browser.close();

    return pdfBuffer;
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
    const resumeSchema = z.object({
        html: z.string().describe("The html content of the resume which can be converted to PDF using any library like puppeteer")
    })

    const prompt = `Generate a Resume for candidate with the following details
    Resume: ${resume}
    Self Description : ${selfDescription}
    Job Description : ${jobDescription}

    the response should be a JSON object with a single field "html" which contains the html content of the resume which can be converted to PDF using any library like puppeteer
    `

    const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
         contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(resumeSchema)
        }
    })

    const jsonContent = JSON.parse(response.text)

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)
    return pdfBuffer

}

export default { generateInterviewReport, generateResumePdf }