
import React, { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import API_PATHS from "../utils/apiPaths";

// Create Context
const UserContext = createContext(null);

// Context Provider
const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [loading, setLoading] = useState(true);

    // Restore logged-in user when application loads
    useEffect(() => {
        const verifyUser = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await axiosInstance.get(
                    API_PATHS.AUTH.GET_PROFILE,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setUser(response.data);
            } catch (error) {
                localStorage.removeItem("token");
                setToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        verifyUser();
    }, []);

    // Login Function
    const login = async (email, password) => {
        const response = await axiosInstance.post(
            API_PATHS.AUTH.LOGIN,
            { email, password }
        );

        const { token: userToken, ...userData } = response.data;

        localStorage.setItem("token", userToken);

        setToken(userToken);
        setUser(userData);

        return userData;
    };

    // Logout Function
    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    };

    return (
        <UserContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                logout,
                isAuthenticated: !!user && !!token,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

// Custom Hook
export const useUser = () => {
    return useContext(UserContext);
};

export default UserProvider;
