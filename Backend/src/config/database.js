import mongoose from "mongoose"


async function connectDB(){
    try{
         await mongoose.connect(process.env.MONGO_URL)
        console.log("Connected to DB")

    }catch(err){
        console.error("Error connecting to MongoDB:", err)
    }
}

export default connectDB