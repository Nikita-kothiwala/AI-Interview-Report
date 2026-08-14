import Router from "express"
import authController from "../controller/auth.controller.js"
import { authUser } from "../middlewares/auth.middleware.js"
import {verifyEmailLimiter,resendOTPLimiter} from "../middlewares/rateLimit.middleware.js";
const router = Router()

/** 
 @Route POST /api/auth/register
 @description Register a new user
@access Public
**/
router.post("/register",authController.registerUser)

/** 
 @Route POST /api/auth/verify-email
 @description Verify email of registered user
@access Public
**/
router.post("/verify-email",verifyEmailLimiter,authController.verifyEmail);

/**
 * @route POST /api/auth/resend-otp
 * @description to resend otp
 */
router.post( "/resend-otp", resendOTPLimiter, authController.resendOTP);


/**
 * @Route POST /api/auth/login
 * @description Login a user
 * @access Public
 */

 router.post("/login",authController.loginUser)


 /**
  * @Route POST /api/auth/logout
  * @description Logout a user and clear token from user cookie and add to blacklist
  * @access Public  
  */

 router.get("/logout",authController.logoutUser)


 /** 
  * @Route GET /api/auth/get-me
  * @description Get the current logged in user details
  * @access Private
  */

 router.get("/get-me",authUser,authController.getMe)


export default router