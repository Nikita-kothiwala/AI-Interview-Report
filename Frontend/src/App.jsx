import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { useDispatch } from "react-redux";
import { router } from "./app.routes.jsx";
import ErrorBoundary from "./features/auth/components/ErrorBoundary.jsx";
import { restoreSession } from "./features/auth/authThunks.js";

function App() {

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(restoreSession());
    }, [dispatch]);

    return (
        <ErrorBoundary>
            <RouterProvider router={router} />
        </ErrorBoundary>
    );
}

export default App;