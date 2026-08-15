import Router from "express"
import authController from "../controller/auth.controller.js"
import { authUser } from "../middlewares/auth.middleware.js"
import {verifyEmailLimiter,resendOTPLimiter, loginLimiter} from "../middlewares/rateLimit.middleware.js";
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

 router.post("/login",loginLimiter,authController.loginUser)

/**
 * @Route POST /api/auth/refresh
 * @description Refresh a token
 * @access Public
 */
 router.post( "/refresh",authController.refreshAccessToken);

 /**
  * @Route POST /api/auth/logout
  * @description Logout a user and clear token from user cookie and add to blacklist
  * @access Public  
  */

 router.post("/logout",authController.logoutUser)


 /** 
  * @Route GET /api/auth/get-me
  * @description Get the current logged in user details
  * @access Private
  */

 router.get("/get-me",authUser,authController.getMe)

  /** 
  * @Route GET /api/auth/forgot-password
  * @description For forgot password
  * @access Public
  */

  router.post( "/forgot-password", authController.forgotPassword);

 /** 
  * @Route GET /api/auth/reset-password
  * @description For reseting password
  * @access Public
  */

router.post("/reset-password",authController.resetPassword);

export default router