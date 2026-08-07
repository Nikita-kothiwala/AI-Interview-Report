import userModel from "../models/user.model.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import cookieParser from "cookie-parser"
import blacklistModel from "../models/blacklist.model.js"

/**
 @name registerUser
 @description Register a new user , expects username, email, and password in the request body
 @route POST /api/auth/register
 @access Public
 */

 async function registerUser(req, res) {
    try {
        const { username, email, password } = req.body;

        if(!username || !email || !password){
            return res.status(400).json({ message: "All fields are required" });
        }

        const isAlreadyExist = await userModel.findOne({ 
            $or: [{ username }
                , { email }]
             });


        if (isAlreadyExist) {
            return res.status(400).json({ message: "Username or email already exists" });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = await userModel.create({
            username,
            email,
            password: passwordHash
        })

        const token = jwt.sign({
            id: newUser._id,
            username: newUser.username,
        },process.env.JWT_SECRET_KEY, { expiresIn: "1d" });

    res.cookie("token", token)
        
       
        res.status(201).json({ 
            message: "User registered successfully",
            user:{
                id: newUser._id,
                username: newUser.username,
                email: newUser.email
            }

         });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


/**
 * @name loginUser
 * @description Login a user, expects email and password in the request body
 * @route POST /api/auth/login
 * @access Public
 */

async function loginUser(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const isUserExist = await userModel.findOne({ email });

    if (!isUserExist) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, isUserExist.password);

    if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid email or password" });
    }   

    const token = jwt.sign({
        id: isUserExist._id,
        username: isUserExist.username,
    }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });

    res.cookie("token", token);

    res.status(200).json({
        message: "User logged in successfully",
        user: {
            id: isUserExist._id,
            username: isUserExist.username,
            email: isUserExist.email
        }
    });

}

/**
 * @name logoutUser
 * @description Logout a user
 * @route POST /api/auth/logout
 * @access Public
 */
async function logoutUser(req, res) {
   try{
     const token = req.cookies.token;

    if (!token) {
        return res.status(400).json({ message: "No token found" });
    }

    if(token){
        await blacklistModel.create({ token });
    }

    res.clearCookie("token");
    res.status(200).json({ message: "User logged out successfully" });
   }catch(error){
    console.error("Error logging out user:", error);
    res.status(500).json({ message: "Internal server error" });
   }


}


/**
 * @name getMe
 * @description Get the current logged in user details
 * @route GET /api/auth/get-me
 */

async function getMe(req, res) {
    try {
        const user = await userModel.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "User details fetched successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}

export default { registerUser ,loginUser, logoutUser, getMe };