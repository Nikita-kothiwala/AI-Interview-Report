import jwt from "jsonwebtoken";
import blacklistModel from "../models/blacklist.model.js";

export async function authUser(req,res,next){
    const token = req.cookies.token;

    if(!token){
        return res.status(401).json({message:"Unauthorized access, Token not found"});
    }

   const isTokenBlackListed = await blacklistModel.findOne({
        token
    })

    if(isTokenBlackListed){
        return res.status(401).json({
            message:"Token is invalid because of blacklisting"
        })
    }

 try{
      const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY)
      req.user = decoded
      next()
 }catch(error){
    console.log(error)
   return res.status(401).json({
    message:"Invalid Token"
   })
 }

   
}

