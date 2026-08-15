export function getApiErrorMessage(error) {

    // Backend responded
    if (error.response) {

        const status =
            error.response.status;

        const backendMessage =
            error.response.data?.message;

        if (backendMessage) {
            return backendMessage;
        }

        switch (status) {

            case 400:
                return "Invalid request.";

            case 401:
                return "Your session has expired. Please login again.";

            case 403:
                return "You are not allowed to perform this action.";

            case 404:
                return "The requested resource was not found.";

            case 409:
                return "This request conflicts with existing data.";

            case 422:
                return "Please check the entered information.";

            case 429:
                return "Too many requests. Please try again later.";

            case 500:
                return "Something went wrong on the server.";

            case 502:
            case 503:
            case 504:
                return "The server is temporarily unavailable.";

            default:
                return "Something went wrong.";
        }
    }


  
    if (error.request) {

        return "Unable to connect to the server. Please check your internet connection.";
    }


   
    return error.message ||
        "Something went wrong.";
}