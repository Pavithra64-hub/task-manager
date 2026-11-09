
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";

const PrivateRoute = ({ allowedRoles }) => {
    const { user, loading, isAuthenticated } = useUser();
    const location = useLocation();

    // Wait until authentication check finishes
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-gray-500">Checking authentication...</p>
            </div>
        );
    }

    // Redirect unauthenticated users to login
    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                state={{ from: location }}
                replace
            />
        );
    }

    // Check user role
    if (!allowedRoles.includes(user.role)) {
        const redirectPath =
            user.role === "admin"
                ? "/admin/dashboard"
                : "/user/dashboard";

        return <Navigate to={redirectPath} replace />;
    }

    // Allow access
    return <Outlet />;
};

export default PrivateRoute;
