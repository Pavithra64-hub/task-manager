
import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import API_PATHS from "../../utils/apiPaths";

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);

    // Fetch all members from backend
    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axiosInstance.get(
                API_PATHS.USERS.GET_ALL
            );

            setUsers(
                Array.isArray(response.data) ? response.data : []
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load team members."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Search members by name or email
    const filteredUsers = useMemo(() => {
        const searchText = search.toLowerCase().trim();

        if (!searchText) return users;

        return users.filter((user) =>
            user.name?.toLowerCase().includes(searchText) ||
            user.email?.toLowerCase().includes(searchText)
        );
    }, [users, search]);

    // Calculate team statistics
    const totalPending = users.reduce(
        (total, user) => total + (user.pendingTasks || 0),
        0
    );

    const totalInProgress = users.reduce(
        (total, user) => total + (user.inProgressTasks || 0),
        0
    );

    const totalCompleted = users.reduce(
        (total, user) => total + (user.completedTasks || 0),
        0
    );

    const totalAssigned =
        totalPending + totalInProgress + totalCompleted;

    // Fetch individual member details
    const handleViewUser = async (userId) => {
        try {
            const response = await axiosInstance.get(
                API_PATHS.USERS.GET_BY_ID(userId)
            );

            setSelectedUser(response.data);
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Unable to load member details."
            );
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">
                    Loading team members...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full min-w-0 bg-gray-50 p-5 md:p-8">

            {/* Heading */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

                <div>
                    <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
                        Manage Users
                    </h1>

                    <p className="text-gray-500 mt-2">
                        View your team members and monitor their task progress.
                    </p>
                </div>

                <button
                    onClick={fetchUsers}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg text-sm font-medium"
                >
                    Refresh Users
                </button>

            </div>

            {/* Error message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">

                {[
                    {
                        label: "Total Members",
                        value: users.length,
                        color: "text-blue-600",
                    },
                    {
                        label: "Pending Tasks",
                        value: totalPending,
                        color: "text-yellow-600",
                    },
                    {
                        label: "In Progress",
                        value: totalInProgress,
                        color: "text-indigo-600",
                    },
                    {
                        label: "Completed Tasks",
                        value: totalCompleted,
                        color: "text-green-600",
                    },
                ].map((item) => (
                    <div
                        key={item.label}
                        className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm"
                    >
                        <p className="text-sm text-gray-500">
                            {item.label}
                        </p>

                        <h2 className={`text-3xl font-bold mt-3 ${item.color}`}>
                            {item.value}
                        </h2>
                    </div>
                ))}

            </div>

            {/* Search */}
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 mb-6">

                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search team members
                </label>

                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
                />

                <p className="text-xs text-gray-500 mt-2">
                    Showing {filteredUsers.length} of {users.length} members
                </p>

            </div>

            {/* Team members */}
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">

                <div className="p-5 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">
                        Team Members
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                        Overview of registered members and assigned tasks.
                    </p>
                </div>

                {filteredUsers.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500 font-medium">
                            No team members found.
                        </p>

                        <p className="text-sm text-gray-400 mt-2">
                            Try another search or register a member account.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[850px] text-left">

                            <thead className="bg-gray-50 text-gray-500 text-sm">
                                <tr>
                                    <th className="px-5 py-4">Member</th>
                                    <th className="px-5 py-4">Pending</th>
                                    <th className="px-5 py-4">In Progress</th>
                                    <th className="px-5 py-4">Completed</th>
                                    <th className="px-5 py-4">Total Tasks</th>
                                    <th className="px-5 py-4">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredUsers.map((user) => {
                                    const pending = user.pendingTasks || 0;
                                    const inProgress = user.inProgressTasks || 0;
                                    const completed = user.completedTasks || 0;

                                    const total =
                                        pending + inProgress + completed;

                                    return (
                                        <tr
                                            key={user._id}
                                            className="border-t border-gray-100 hover:bg-gray-50"
                                        >

                                            {/* Member information */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">

                                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold uppercase shrink-0">
                                                        {user.name?.charAt(0) || "U"}
                                                    </div>

                                                    <div>
                                                        <p className="font-medium text-gray-800">
                                                            {user.name}
                                                        </p>

                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {user.email}
                                                        </p>
                                                    </div>

                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-full text-xs font-medium">
                                                    {pending}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-xs font-medium">
                                                    {inProgress}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-medium">
                                                    {completed}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="font-semibold text-gray-800">
                                                    {total}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <button
                                                    onClick={() => handleViewUser(user._id)}
                                                    className="text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md text-sm font-medium"
                                                >
                                                    View Details
                                                </button>
                                            </td>

                                        </tr>
                                    );
                                })}
                            </tbody>

                        </table>

                    </div>
                )}

                <div className="p-5 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                        {users.length} registered team member(s)
                    </p>
                </div>

            </div>

            {/* Member details modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">

                    <div className="bg-white w-full max-w-lg rounded-xl shadow-xl overflow-hidden">

                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-800">
                                Member Details
                            </h2>

                            <button
                                onClick={() => setSelectedUser(null)}
                                className="text-gray-500 hover:text-gray-800 text-2xl"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="p-6">

                            <div className="flex items-center gap-4 mb-6">

                                <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold uppercase">
                                    {selectedUser.name?.charAt(0) || "U"}
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-800 text-lg">
                                        {selectedUser.name}
                                    </h3>

                                    <p className="text-sm text-gray-500">
                                        {selectedUser.email}
                                    </p>

                                    <p className="text-xs text-blue-600 mt-1">
                                        {selectedUser.role}
                                    </p>
                                </div>

                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 space-y-3">

                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">
                                        Account created
                                    </span>

                                    <span className="font-medium text-gray-800">
                                        {selectedUser.createdAt
                                            ? new Date(selectedUser.createdAt).toLocaleDateString()
                                            : "Not available"}
                                    </span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">
                                        Email
                                    </span>

                                    <span className="font-medium text-gray-800 break-all ml-4">
                                        {selectedUser.email}
                                    </span>
                                </div>

                            </div>

                            <button
                                onClick={() => setSelectedUser(null)}
                                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
                            >
                                Close
                            </button>

                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default ManageUsers;
