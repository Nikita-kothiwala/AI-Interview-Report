import React, { useState } from "react";
import "../auth.form.scss";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth.js";
import {loginUser} from "../authThunks.js";
import "/src/style.scss"
const Login = () => {

    const navigate = useNavigate();

    const {
        loading,
        error,
        handleLogin
    } = useAuth();


    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");


    const handleSubmit = async (e) => {

        e.preventDefault();

        const result = await handleLogin({
            email,
            password
        });

        if (loginUser.fulfilled.match(result)) {
            navigate("/");
        }
    };


    if (loading) {

        return (
            <main>
                <h1>
                    Loading...
                </h1>
            </main>
        );
    }


    return (

        <main>

            <div className="form-container">

                <h1>LOGIN</h1>

                {error && (
                    <p className="error">
                        {error}
                    </p>
                )}


                <form
                    onSubmit={handleSubmit}
                >

                    <div className="input-group">

                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            onChange={(e) =>
                                setEmail(
                                    e.target.value
                                )
                            }
                            type="email"
                            id="email"
                            value={email}
                            placeholder="Enter Your Email Address"
                        />

                    </div>


                    <div className="input-group">

                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            onChange={(e) =>
                                setPassword(
                                    e.target.value
                                )
                            }
                            type="password"
                            id="password"
                            value={password}
                            placeholder="Enter Your Password"
                        />

                    </div>


                    <button
                        className="button primary-button"
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Logging in..."
                            : "Login"}
                    </button>

                </form>


                <p>
                    Don't have an account?

                    {" "}

                    <Link to="/register">
                        Register
                    </Link>

                </p>

            </div>

        </main>
    );
};

export default Login;