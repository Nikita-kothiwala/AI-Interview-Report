import React, { useEffect,useState} from "react";
import { useLocation, useNavigate} from "react-router";
import {verifyEmail, resendOTP} from "../services/auth.api.js";
import ErrorMessage from "../components/ErrorMessage.jsx";

const VerifyEmail = () => {

    const location = useLocation();
    const navigate = useNavigate();


    const email = location.state?.email;


    const [otp, setOtp] = useState("");

    const [loading, setLoading] = useState(false);

    const [resendLoading, setResendLoading] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    const [countdown, setCountdown] = useState(60);


    
    useEffect(() => {

        if (countdown <= 0) {
            return;
        }

        const timer = setInterval(() => {

                setCountdown(
                    previous =>
                        previous - 1
                );

            }, 1000);


        return () => {
            clearInterval(timer);
        };

    }, [countdown]);


    // Verify OTP
    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");


        if (!email) {

            setError(
                "Verification email is missing. Please register again."
            );

            return;
        }


        if (otp.length !== 6) {

            setError(
                "Please enter a valid 6-digit OTP."
            );

            return;
        }


        try {

            setLoading(true);


            await verifyEmail({
                email,
                otp
            });


            navigate("/login", {
                state: {
                    message:
                        "Email verified successfully. Please login."
                }
            });


        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Unable to verify OTP."
            );

        } finally {

            setLoading(false);

        }
    };


    // Resend OTP
    const handleResendOTP = async () => {

        if (countdown > 0) {
            return;
        }


        setError("");
        setSuccess("");


        try {

            setResendLoading(true);


            await resendOTP({
                email
            });


            setSuccess(
                "A new OTP has been sent to your email."
            );


            setOtp("");

            setCountdown(60);


        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Unable to resend OTP."
            );

        } finally {

            setResendLoading(false);

        }

    };


    if (!email) {

        return (

            <main>

                <div className="form-container">

                    <h1>
                        Verification Session Expired
                    </h1>

                    <p>
                        Please register again to
                        verify your email.
                    </p>

                    <button
                        className="button primary-button"
                        onClick={() =>
                            navigate("/register")
                        }
                    >
                        Go to Register
                    </button>

                </div>

            </main>
        );
    }


    return (

        <main>

            <div className="form-container">

                <h1>
                    Verify Email
                </h1>


                <p>
                    Enter the 6-digit OTP sent to:
                </p>


                <strong>
                    {email}
                </strong>


                <form
                    onSubmit={handleSubmit}
                >

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
                            onChange={(e) =>
                                setOtp(
                                    e.target.value
                                        .replace(/\D/g, "")
                                )
                            }
                            placeholder="Enter 6-digit OTP"
                            autoComplete="one-time-code"
                        />

                    </div>


                   <ErrorMessage message={error} />


                    {success && (
                        <p className="success">
                            {success}
                        </p>
                    )}


                    <button
                        type="submit"
                        disabled={
                            loading ||
                            otp.length !== 6
                        }
                        className="button primary-button"
                    >

                        {loading
                            ? "Verifying..."
                            : "Verify Email"}

                    </button>

                </form>


                <div className="resend-container">

                    {countdown > 0 ? (

                        <p>
                            Resend OTP in{" "}
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

            </div>

        </main>
    );
};


export default VerifyEmail;