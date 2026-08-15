import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { forgotPassword } from "../services/auth.api.js";
import "../auth.form.scss";
import ErrorMessage from "../components/ErrorMessage.jsx";

const ForgotPassword = () => {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");


    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");


        if (!email.trim()) {

            setError("Email is required");

            return;
        }


        try {

            setLoading(true);


            await forgotPassword({
                email: email.trim()
            });


            /*
             * We don't reveal whether the email
             * actually exists.
             */

            setSuccess(
                "If an account exists with this email, a password reset OTP has been sent."
            );


            /*
             * Pass email to reset-password page.
             */

            setTimeout(() => {

                navigate("/reset-password", {
                    state: {
                        email: email.trim()
                    }
                });

            }, 1000);


        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Something went wrong. Please try again."
            );

        } finally {

            setLoading(false);

        }
    };


    return (

        <main>

            <div className="form-container">

                <h1>
                    Forgot Password
                </h1>


                <p>
                    Enter your registered email address
                    to receive a password reset OTP.
                </p>


                <form
                    onSubmit={handleSubmit}
                >

                    <div className="input-group">

                        <label htmlFor="email">
                            Email
                        </label>


                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            placeholder="Enter your email"
                            autoComplete="email"
                            required
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
                        disabled={loading}
                        className="button primary-button"
                    >

                        {loading
                            ? "Sending OTP..."
                            : "Send OTP"}

                    </button>

                </form>


                <p>

                    Remember your password?

                    {" "}

                    <Link to="/login">
                        Login
                    </Link>

                </p>


            </div>

        </main>
    );
};


export default ForgotPassword;