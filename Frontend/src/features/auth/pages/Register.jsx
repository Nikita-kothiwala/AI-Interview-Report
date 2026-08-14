import React, { useState } from 'react'
import "../auth.form.scss"
import { useNavigate, Link } from 'react-router'
import { useAuth } from '../hooks/useAuth.js'
import "/src/style.scss"

const Register = () => {
    const navigate = useNavigate()
    const { loading, handleRegister } = useAuth()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [username, setUsername] = useState("")

    const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        const data = await handleRegister({
            username,
            email,
            password
        });

        navigate("/verify-email", {
            state: {
                email: data.email || email
            }
        });

    } catch (error) {
        console.log(error);
    }
};

    if (loading) {
        return (
            <main>
                <h1>Loading.........</h1>
            </main>
        )
    }

    return (
        <main>
            <div className="form-container">
                <h1>Register</h1>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor='username'>Username</label>
                        <input
                            onChange={(e) => setUsername(e.target.value)}
                            type="text"
                            id='username'
                            name='email'
                            placeholder='Enter Your USername' />
                    </div>
                    <div className="input-group">
                        <label htmlFor='email'>Email</label>
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            id='email'
                            name='email'
                            placeholder='Enter Your Email Address' />
                    </div>
                    <div className="input-group">
                        <label htmlFor='password'>Password</label>
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            id='password'
                            name='password'
                            placeholder='Enter Your password' />
                    </div>

                    <button className='button primary-button'>Register</button>

                </form>

                <p>Already have an account ? <Link to={"/login"}>Login</Link> </p>
            </div>
        </main>
    )
}

export default Register
