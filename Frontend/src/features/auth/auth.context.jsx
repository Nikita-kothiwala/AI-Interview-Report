import {createContext,useState,useEffect} from "react";
import {getMe,refreshToken} from "./services/auth.api.js";
import {setAccessToken} from "./services/api.js";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

        const [user, setUser] =
            useState(null);

        const [loading, setLoading] =
            useState(true);

        useEffect(() => {

            const restoreSession =
                async () => {

                    try {

                        const data = await refreshToken();

                        setAccessToken(
                            data.accessToken
                        );

                        const userData =
                            await getMe();

                        setUser(
                            userData.user
                        );

                    } catch (error) {

                        console.log(
                            "No active session"
                        );

                        setUser(null);

                    } finally {

                        setLoading(false);
                    }
                };

            restoreSession();

        }, []);

        return (
            <AuthContext.Provider
                value={{
                    user,
                    setUser,
                    loading,
                    setLoading
                }}
            >
                {children}
            </AuthContext.Provider>
        );
    };