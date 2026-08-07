import mongoose from "mongoose"

/**
 * - Job Description : String
 * - Resume text : String
 * - Self Description : String
 * 
 *        |
 * 
 *  - matchScore - Nummber
 *  - Technical questions : 
 * [{
 *    question : "",
 *    intention : "",
 *    answer : ""
 * }]
 * 
 *  - Behavioural questions : 
 * [{
 *    question : "",
 *    intention : "",
 *    answer : ""
 * }]
 * - Skill gaps : [{
 *       slills : "",
 *       severity :{
 *       type:String,
 *        enum : ["low","medium","high"]}
 * }]
 * - Preperation plan : [{
 *                day : Number,
 *                focus : String,
 *                task : [String]
 * }]
 * 
 * 
 */
const technicalQuestionsSchema = new mongoose.Schema({
   
    question : {
        type: String,
        required : [true , "Technical Question is required"]
    },
    intention : {
        type: String,
        required : [true , "Intention is required"]
    },
    answer : {
        type: String,
        required : [true , "Answer is required"]
    }
},{
    _id: false
})

const behaviouralQuestionsSchema = new mongoose.Schema({
     question : {
        type: String,
        required : [true , "Technical Question is required"]
    },
    intention : {
        type: String,
        required : [true , "Intention is required"]
    },
    answer : {
        type: String,
        required : [true , "Answer is required"]
    }

},{
    _id:false
})

const skillGapsSchema = new mongoose.Schema({
    skills:{
        type:String,
        required: [true, "Skills is required"]
    },
     severity : {
            type:String,
            enum : ["low", "medium", "high"],
            required : [true, "Severity is required"]
        }
},{
    _id:false
})

const preparationPlanSchema = new mongoose.Schema({
    day:{
        type:Number,
        required:[true, "Date is required"],
    },
    focus:{
        type:String,
        required:[true, "Focus is required"]
    },
    tasks : [{
        type:String,
        required:[true, "Task is required"]
    }]
})
const interviewReportSchema = new mongoose.Schema({

    jobDescription :{
        type: String,
        required : [true, "Job Description is required"]
    },
    resume : {
        type:String
    },
    selfDescription : {
        type : String
    },
    matchScore : {
        type : Number,
        min : 0,
        max : 100
    },
    technicalQuestions : [technicalQuestionsSchema],
    behaviourQuestions : [behaviouralQuestionsSchema],
    skillGaps : [skillGapsSchema],
    preparationPlan : [preparationPlanSchema],
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"users"
    },
    
},{
    timestamps:true
})


const interviewReportModel = mongoose.model("userinterviewreport", interviewReportSchema)

export default interviewReportModel