import React from "react";
import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth.js";


const Protected = ({ children }) => {

    const {
        user,
        initialized
    } = useAuth();


    if (!initialized) {

        return (
            <main>
                <h1>Loading...</h1>
            </main>
        );
    }


    if (!user) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }


    return children;
};

export default Protected;