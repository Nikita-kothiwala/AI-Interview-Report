import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true,
});

let accessToken = null;

export const setAccessToken = (token) => {
    accessToken = token;
};

export const clearAccessToken = () => {
    accessToken = null;
};

// ================================
// REQUEST INTERCEPTOR
// ================================

api.interceptors.request.use(
    (config) => {

        if (accessToken) {
            config.headers.Authorization =
                `Bearer ${accessToken}`;
        }

        return config;
    },

    (error) => {
        return Promise.reject(error);
    }
);

// ================================
// RESPONSE INTERCEPTOR
// ================================

let isRefreshing = false;

let failedQueue = [];

const processQueue = (error, token = null) => {

    failedQueue.forEach((promise) => {

        if (error) {
            promise.reject(error);
        } else {
            promise.resolve(token);
        }

    });

    failedQueue = [];
};

api.interceptors.response.use(

    (response) => {
        return response;
    },

    async (error) => {

        const originalRequest = error.config;

        // Only handle 401 errors
        if (
            error.response?.status !== 401 ||
            originalRequest?._retry
        ) {
            return Promise.reject(error);
        }

        // Prevent infinite refresh loop
        if (
            originalRequest.url?.includes(
                "/api/auth/refresh"
            )
        ) {

            clearAccessToken();

            return Promise.reject(error);
        }

        // Another request is already refreshing
        if (isRefreshing) {

            return new Promise(
                (resolve, reject) => {

                    failedQueue.push({
                        resolve,
                        reject
                    });

                }
            )
            .then((token) => {

                originalRequest.headers.Authorization =
                    `Bearer ${token}`;

                return api(originalRequest);

            })
            .catch((error) => {

                return Promise.reject(error);
            });
        }

        originalRequest._retry = true;

        isRefreshing = true;

        try {

            const response = await axios.post(
                "http://localhost:3000/api/auth/refresh",
                {},
                {
                    withCredentials: true
                }
            );

            const newAccessToken =
                response.data.accessToken;

            setAccessToken(newAccessToken);

            processQueue(
                null,
                newAccessToken
            );

            originalRequest.headers.Authorization =
                `Bearer ${newAccessToken}`;

            return api(originalRequest);

        } catch (refreshError) {

            processQueue(
                refreshError,
                null
            );

            clearAccessToken();

            return Promise.reject(
                refreshError
            );

        } finally {

            isRefreshing = false;
        }
    }
);

export default api;