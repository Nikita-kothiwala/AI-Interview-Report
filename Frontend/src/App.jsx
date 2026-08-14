import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { useDispatch } from "react-redux";

import { router } from "./app.routes.jsx";
import { Interviewprovider } from "./features/interview/interview.context.jsx";

import { restoreSession } from "./features/auth/authThunks.js";


function App() {

    const dispatch = useDispatch();

    useEffect(() => {

        dispatch(
            restoreSession()
        );

    }, [dispatch]);


    return (
        <Interviewprovider>
            <RouterProvider router={router} />
        </Interviewprovider>
    );
}

export default App;