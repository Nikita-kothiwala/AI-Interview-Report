import {createBrowserRouter} from "react-router"
import Login from "./features/auth/pages/Login.jsx"
import Register from "./features/auth/pages/Register.jsx"
import Protected from "./features/auth/components/Protected.jsx"
import Home from "./features/interview/pages/Home.jsx"
import Interview from "./features/interview/pages/Interview.jsx"
import VerifyEmail from "./features/auth/pages/VerifyEmail.jsx"
import ForgotPassword from "./features/auth/pages/ForgotPassword.jsx"
import ResetPassword from "./features/auth/pages/ResetPassword.jsx"

export const router = createBrowserRouter([
    {
        path :"/login",
        element : <Login/>
    },
    {
        path : "/register",
        element : <Register/>
    },
     {
        path:"/verify-email",
        element:<VerifyEmail/>
    },
      {
        path:"/forgot-password",
        element:<ForgotPassword/>
    },
     {
        path:"/forgot-password",
        element:<ForgotPassword/>
    },
     {
        path:"/reset-password",
        element:<ResetPassword/>
    },
    {
        path:"/",
        element:<Protected><Home/></Protected>
    },
    {
        path:"/interview/:interviewId",
        element:<Protected><Interview/></Protected>
    },
   
])