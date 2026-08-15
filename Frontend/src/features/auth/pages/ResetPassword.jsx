import React, {useEffect,useState} from "react";
import {Link,useLocation,useNavigate} from "react-router";
import {resetPassword,forgotPassword} from "../services/auth.api.js";
import "../auth.form.scss";
import ErrorMessage from "../components/ErrorMessage.jsx";

const ResetPassword = () => {

    const navigate = useNavigate();
    const location = useLocation();


    /*
     * Email is passed from ForgotPassword.jsx
     *
     * navigate("/reset-password", {
     *     state: { email }
     * })
     */

    const email = location.state?.email || "";


    const [otp, setOtp] = useState("");

    const [newPassword, setNewPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");


    const [loading, setLoading] =
        useState(false);

    const [resendLoading, setResendLoading] =
        useState(false);


    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    /*
     * Resend OTP cooldown
     */

    const [countdown, setCountdown] =
        useState(60);


    /*
     * Countdown timer
     */

    useEffect(() => {

        if (countdown <= 0) {
            return;
        }


        const timer = setInterval(() => {

            setCountdown(
                previous => previous - 1
            );

        }, 1000);


        return () => {
            clearInterval(timer);
        };

    }, [countdown]);


    /*
     * If user directly opens
     * /reset-password without coming
     * from Forgot Password page.
     */

    if (!email) {

        return (

            <main>

                <div className="form-container">

                    <h1>
                        Invalid Reset Request
                    </h1>


                    <p>
                        Please request a new
                        password reset OTP.
                    </p>


                    <Link
                        to="/forgot-password"
                        className="button primary-button"
                    >
                        Forgot Password
                    </Link>

                </div>

            </main>
        );
    }


    /*
     * Reset Password
     */

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");


        /*
         * Validate OTP
         */

        if (!otp) {

            setError(
                "Please enter the OTP."
            );

            return;
        }


        if (otp.length !== 6) {

            setError(
                "OTP must be 6 digits."
            );

            return;
        }


        /*
         * Validate new password
         */

        if (!newPassword) {

            setError(
                "Please enter a new password."
            );

            return;
        }


        if (newPassword.length < 8) {

            setError(
                "Password must be at least 8 characters long."
            );

            return;
        }


        /*
         * Confirm password
         */

        if (!confirmPassword) {

            setError(
                "Please confirm your password."
            );

            return;
        }


        if (
            newPassword !== confirmPassword
        ) {

            setError(
                "Passwords do not match."
            );

            return;
        }


        try {

            setLoading(true);


            /*
             * Backend expects:
             *
             * {
             *     email,
             *     otp,
             *     newPassword
             * }
             */

            await resetPassword({

                email,

                otp,

                newPassword

            });


            setSuccess(
                "Password reset successfully. Redirecting to login..."
            );


            /*
             * Redirect to login after
             * successful password reset.
             */

            setTimeout(() => {

                navigate("/login");

            }, 1500);


        } catch (error) {

            console.error(
                "Reset password error:",
                error.response?.data ||
                error.message
            );


            setError(
                error.response?.data?.message ||
                "Unable to reset password. Please try again."
            );

        } finally {

            setLoading(false);

        }
    };


    /*
     * Resend OTP
     *
     * We use the existing:
     *
     * POST /api/auth/forgot-password
     *
     * There is NO separate
     * resend-password-reset-otp API.
     */

    const handleResendOTP = async () => {

        /*
         * Prevent multiple requests
         */

        if (
            countdown > 0 ||
            resendLoading
        ) {
            return;
        }


        try {

            setError("");
            setSuccess("");

            setResendLoading(true);


            /*
             * Existing backend API
             */

            await forgotPassword({
                email
            });


            /*
             * Clear old OTP
             */

            setOtp("");


            /*
             * Restart countdown
             */

            setCountdown(60);


            setSuccess(
                "If an account exists with this email, a new OTP has been sent."
            );


        } catch (error) {

            console.error(
                "Resend OTP error:",
                error.response?.data ||
                error.message
            );


            setError(
                error.response?.data?.message ||
                "Unable to resend OTP. Please try again."
            );

        } finally {

            setResendLoading(false);

        }
    };


    return (

        <main>

            <div className="form-container">

                <h1>
                    Reset Password
                </h1>


                <p>
                    Enter the OTP sent to:
                </p>


                <p>
                    <strong>
                        {email}
                    </strong>
                </p>


                <form
                    onSubmit={handleSubmit}
                >

                    {/* ================= OTP ================= */}

                    <div className="input-group">

                        <label htmlFor="otp">
                            OTP
                        </label>


                        <input
                            id="otp"
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => {

                                const value =
                                    e.target.value.replace(
                                        /\D/g,
                                        ""
                                    );

                                setOtp(value);

                            }}
                            placeholder="Enter 6-digit OTP"
                            autoComplete="one-time-code"
                            required
                        />

                    </div>


                    {/* ================= NEW PASSWORD ================= */}

                    <div className="input-group">

                        <label htmlFor="newPassword">
                            New Password
                        </label>


                        <input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) =>
                                setNewPassword(
                                    e.target.value
                                )
                            }
                            placeholder="Enter new password"
                            autoComplete="new-password"
                            required
                        />

                    </div>


                    {/* ================= CONFIRM PASSWORD ================= */}

                    <div className="input-group">

                        <label htmlFor="confirmPassword">
                            Confirm Password
                        </label>


                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) =>
                                setConfirmPassword(
                                    e.target.value
                                )
                            }
                            placeholder="Confirm new password"
                            autoComplete="new-password"
                            required
                        />

                    </div>


                    {/* ================= ERROR ================= */}

                   <ErrorMessage message={error} />


                    {/* ================= SUCCESS ================= */}

                    {success && (

                        <p className="success">
                            {success}
                        </p>

                    )}


                    {/* ================= RESET BUTTON ================= */}

                    <button
                        type="submit"
                        disabled={loading}
                        className="button primary-button"
                    >

                        {loading
                            ? "Resetting Password..."
                            : "Reset Password"}

                    </button>

                </form>


                {/* ================= RESEND OTP ================= */}

                <div style={{ marginTop: "20px" }}>

                    {countdown > 0 ? (

                        <p>

                            Didn't receive the OTP?

                            {" "}

                            Resend in{" "}

                            <strong>
                                {countdown}s
                            </strong>

                        </p>

                    ) : (

                        <button
                            type="button"
                            onClick={handleResendOTP}
                            disabled={resendLoading}
                            className="button"
                        >

                            {resendLoading
                                ? "Sending..."
                                : "Resend OTP"}

                        </button>

                    )}

                </div>


                {/* ================= BACK TO LOGIN ================= */}

                <p>

                    <Link to="/login">
                        Back to Login
                    </Link>

                </p>

            </div>

        </main>
    );
};


export default ResetPassword;