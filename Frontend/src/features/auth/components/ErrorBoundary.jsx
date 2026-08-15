import React from "react";

class ErrorBoundary extends React.Component {

    constructor(props) {

        super(props);

        this.state = {
            hasError: false
        };
    }


    static getDerivedStateFromError() {

        return {
            hasError: true
        };
    }


    componentDidCatch(
        error,
        errorInfo
    ) {

        console.error(
            "React Error Boundary:",
            error,
            errorInfo
        );
    }


    handleReload = () => {

        window.location.reload();
    };


    render() {

        if (this.state.hasError) {

            return (
                <main className="error-page">

                    <h1>
                        Something went wrong
                    </h1>

                    <p>
                        We couldn't load this page.
                    </p>

                    <button
                        onClick={this.handleReload}
                    >
                        Reload Page
                    </button>

                </main>
            );
        }


        return this.props.children;
    }
}

export default ErrorBoundary;