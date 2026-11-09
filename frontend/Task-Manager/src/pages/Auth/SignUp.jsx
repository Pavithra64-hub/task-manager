
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    FiUser,
    FiMail,
    FiLock,
    FiEye,
    FiEyeOff,
    FiArrowRight,
} from "react-icons/fi";

import AuthLayout from "../../components/layouts/AuthLayout";
import axiosInstance from "../../utils/axiosInstance";
import API_PATHS from "../../utils/apiPaths";

const SignUp = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (
            !formData.name.trim() ||
            !formData.email.trim() ||
            !formData.password ||
            !formData.confirmPassword
        ) {
            setError("Please fill in all fields.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must contain at least 6 characters.");
            return;
        }

        try {
            setSubmitting(true);

            const response = await axiosInstance.post(
                API_PATHS.AUTH.REGISTER,
                {
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    password: formData.password,
                }
            );

            setSuccess(
                response.data.message || "Account created successfully!"
            );

            setTimeout(() => {
                navigate("/login");
            }, 1200);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Registration failed. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthLayout>
            <div className="flex flex-col justify-center max-w-md mx-auto min-h-[calc(100vh-100px)] py-8">

                <h2 className="text-2xl font-semibold text-black">
                    Create an account
                </h2>

                <p className="text-sm text-gray-500 mt-2 mb-7">
                    Join Task Manager and organize your work efficiently.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full name
                        </label>

                        <div className="relative">
                            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email address
                        </label>

                        <div className="relative">
                            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>

                        <div className="relative">
                            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Create a password"
                                className="w-full border border-gray-300 rounded-lg pl-10 pr-12 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                            >
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm password
                        </label>

                        <div className="relative">
                            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm your password"
                                className="w-full border border-gray-300 rounded-lg pl-10 pr-12 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                            >
                                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-red-600">{error}</p>
                    )}

                    {success && (
                        <p className="text-sm text-green-600">{success}</p>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-60"
                    >
                        {submitting ? "Creating account..." : "Create account"}
                        {!submitting && <FiArrowRight />}
                    </button>

                </form>

                <p className="text-sm text-gray-600 text-center mt-6">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="text-blue-600 font-medium hover:underline"
                    >
                        Login
                    </Link>
                </p>

            </div>
        </AuthLayout>
    );
};

export default SignUp;
