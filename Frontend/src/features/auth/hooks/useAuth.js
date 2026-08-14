import {
    useDispatch,
    useSelector
} from "react-redux";

import {
    loginUser,
    logoutUser,
    registerUser
} from "../authThunks.js";


export const useAuth = () => {

    const dispatch = useDispatch();

    const {
        user,
        loading,
        initialized,
        error
    } = useSelector(
        (state) => state.auth
    );


    const handleLogin = async ({
        email,
        password
    }) => {

        return dispatch(
            loginUser({
                email,
                password
            })
        );
    };


    const handleRegister = async ({
        username,
        email,
        password
    }) => {

        return dispatch(
            registerUser({
                username,
                email,
                password
            })
        );
    };


    const handleLogout = async () => {

        return dispatch(
            logoutUser()
        );
    };


    return {
        user,
        loading,
        initialized,
        error,
        handleLogin,
        handleRegister,
        handleLogout
    };
};