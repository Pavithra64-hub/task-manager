
import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import API_PATHS from "../../utils/apiPaths";
import { useUser } from "../../context/UserContext";

const UserDashboard = () => {
    const { user } = useUser();

    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                const response = await axiosInstance.get(
                    API_PATHS.TASKS.USER_DASHBOARD_DATA
                );

                setDashboardData(response.data);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Unable to load dashboard data."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-500">Loading dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-red-600">
                {error}
            </div>
        );
    }

    const statistics = dashboardData?.statistics || {};
    const recentTasks = dashboardData?.recentTasks || [];

    const statCards = [
        {
            title: "Total Tasks",
            value: statistics.totalTasks || 0,
            color: "bg-blue-100 text-blue-700",
        },
        {
            title: "Pending Tasks",
            value: statistics.pendingTasks || 0,
            color: "bg-yellow-100 text-yellow-700",
        },
        {
            title: "Completed Tasks",
            value: statistics.completedTasks || 0,
            color: "bg-green-100 text-green-700",
        },
        {
            title: "Overdue Tasks",
            value: statistics.overdueTasks || 0,
            color: "bg-red-100 text-red-700",
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10">

            {/* Welcome section */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
                    Welcome back, {user?.name || "User"}!
                </h1>

                <p className="text-gray-500 mt-2">
                    Here's an overview of your assigned tasks.
                </p>
            </div>

            {/* Statistics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
                {statCards.map((card) => (
                    <div
                        key={card.title}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                    >
                        <p className="text-sm text-gray-500">
                            {card.title}
                        </p>

                        <div className="flex items-center justify-between mt-4">
                            <h2 className="text-3xl font-bold text-gray-800">
                                {card.value}
                            </h2>

                            <span className={`px-3 py-2 rounded-lg text-sm font-medium ${card.color}`}>
                                {card.title.split(" ")[0]}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent tasks */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">

                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">
                        Recent Tasks
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                        Your latest assigned tasks
                    </p>
                </div>

                {recentTasks.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                        No tasks assigned to you yet.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-sm">
                                <tr>
                                    <th className="p-4">Task</th>
                                    <th className="p-4">Priority</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Due Date</th>
                                </tr>
                            </thead>

                            <tbody>
                                {recentTasks.map((task) => (
                                    <tr
                                        key={task._id}
                                        className="border-t border-gray-100 hover:bg-gray-50"
                                    >
                                        <td className="p-4 font-medium text-gray-800">
                                            {task.title}
                                        </td>

                                        <td className="p-4 text-sm">
                                            {task.priority}
                                        </td>

                                        <td className="p-4">
                                            <span className="text-sm px-3 py-1 rounded-full bg-blue-50 text-blue-700">
                                                {task.status}
                                            </span>
                                        </td>

                                        <td className="p-4 text-sm text-gray-500">
                                            {task.dueDate
                                                ? new Date(task.dueDate).toLocaleDateString()
                                                : "No due date"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

        </div>
    );
};

export default UserDashboard;
