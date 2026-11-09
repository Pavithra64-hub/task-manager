
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import {
    FiMail,
    FiLock,
    FiEye,
    FiEyeOff,
    FiArrowRight,
} from "react-icons/fi";

import AuthLayout from "../../components/layouts/AuthLayout";
import { useUser } from "../../context/UserContext";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const { login } = useUser();

    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSubmitting(true);

        try {
            const user = await login(email, password);

            // Redirect according to user role
            const dashboard =
                user.role === "admin"
                    ? "/admin/dashboard"
                    : "/user/dashboard";

            navigate(location.state?.from?.pathname || dashboard, {
                replace: true,
            });

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Login failed. Please check your credentials."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthLayout>
            <div className="flex flex-col justify-center max-w-md mx-auto h-[calc(100vh-100px)]">

                {/* Heading */}
                <div className="mb-8">
                    <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                        Welcome Back
                    </h1>

                    <p className="text-sm text-gray-500">
                        Please enter your details to sign in.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>

                        <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3 gap-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                            <FiMail className="text-gray-400" size={18} />

                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                className="w-full outline-none text-sm text-gray-800 bg-transparent"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>

                        <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3 gap-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                            <FiLock className="text-gray-400" size={18} />

                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                className="w-full outline-none text-sm text-gray-800 bg-transparent"
                                required
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-gray-400 hover:text-gray-700"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <FiEyeOff size={18} />
                                ) : (
                                    <FiEye size={18} />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                            {error}
                        </p>
                    )}

                    {/* Remember Me */}
                    <div className="flex items-center text-sm">
                        <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                            <input
                                type="checkbox"
                                className="accent-blue-600"
                            />
                            Remember me
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium py-3 rounded-lg transition duration-200"
                    >
                        {submitting ? "Signing In..." : "Sign In"}

                        {!submitting && <FiArrowRight size={18} />}
                    </button>

                </form>

                {/* Signup Link */}
                <p className="text-sm text-center text-gray-500 mt-8">
                    Don't have an account?{" "}

                    <Link
                        to="/signup"
                        className="text-blue-600 font-semibold hover:text-blue-700"
                    >
                        Create an account
                    </Link>
                </p>

            </div>
        </AuthLayout>
    );
};

export default Login;
