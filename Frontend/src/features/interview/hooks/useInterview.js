import {getAllInterviewReports, getAllInterviewReportsById, generateInterviewReport,generateResumePdf} from "../services/interview.ai.js"
import { useContext,useEffect } from "react"
import { InterviewContext } from "../interview.context.jsx"
import { useNavigate, useParams } from "react-router"

export const useInterview  = () => {
    const context = useContext(InterviewContext)
    const navigate = useNavigate()
      const {interviewId} = useParams()
    
  

    if(!context){
       throw new Error("useInterview must be used within an InterviewProvider")
    }

    const {loading , setLoading, report, setReport, reports, setReports } = context

    const generateReport = async({jobDescription, selfDescription,resumeFile}) =>{
          let response = null
        setLoading(true)
        try{
             response = await generateInterviewReport({jobDescription, selfDescription, resumeFile})
            setReport(response.interviewReport)

        }catch(error){
          console.log(error)
        }finally{
           setLoading(false)
        }

        return response.interviewReport
    }

    const generateById = async (interviewId) =>{
         let response = null
        setLoading(true)
        try {
            response = await getAllInterviewReportsById(interviewId)
            setReport(response.interviewReport)
            
        } catch (error) {
            console.log(error)
            
        }finally{
            setLoading(false)
        }

        return response.interviewReport
    }

    const getReports = async() =>{
        let response = null
        setLoading(true)
        try {
            response = await getAllInterviewReports()
            setReports(response.interviewReports)
            
        } catch (error) {
            console.log(error)
        }finally{
            setLoading(false)
        }

        return response.interviewReports
    }


    const getResumePdf = async(interviewReportId) =>{
       setLoading(true)
       let response = null;
       try{
        response = await generateResumePdf({interviewReportId})
        const url = window.URL.createObjectURL(new Blob([response],{type:"application/pdf"}))
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download",`resume_${interviewReportId}.pdf`)
        document.body.appendChild(link)
        link.click()
       }catch(error){
        console.log(error)
       }finally{
        setLoading(false)
       }
    }

        useEffect(()=>{
        if(interviewId){
            generateById(interviewId)
        }else{
            getReports()
        }
    
      },[interviewId])

    return {loading, report, reports, generateById, getReports, generateReport,getResumePdf}
}

