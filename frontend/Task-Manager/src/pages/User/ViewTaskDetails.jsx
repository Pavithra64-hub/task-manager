
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import API_PATHS from "../../utils/apiPaths";

const ViewTaskDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [downloadingAttachment, setDownloadingAttachment] = useState("");

    // Fetch individual task details
    useEffect(() => {
        const fetchTaskDetails = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await axiosInstance.get(
                    API_PATHS.TASKS.GET_BY_ID(id)
                );

                setTask(response.data);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Unable to load task details."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchTaskDetails();
    }, [id]);

    // Download task attachment
    const handleDownloadAttachment = async (attachment) => {
        try {
            const filename = attachment.split("/").pop();

            setDownloadingAttachment(filename);

            const response = await axiosInstance.get(
                `/tasks/${id}/attachments/${encodeURIComponent(filename)}`,
                {
                    responseType: "blob",
                }
            );

            const blobUrl = window.URL.createObjectURL(
                new Blob([response.data])
            );

            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = filename;

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(blobUrl);
        } catch (err) {
            console.error("Attachment download failed:", err);
            alert("Unable to download attachment. Please try again.");
        } finally {
            setDownloadingAttachment("");
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "Completed":
                return "bg-green-100 text-green-700";
            case "In Progress":
                return "bg-blue-100 text-blue-700";
            default:
                return "bg-yellow-100 text-yellow-700";
        }
    };

    const getPriorityStyle = (priority) => {
        switch (priority) {
            case "High":
                return "bg-red-100 text-red-700";
            case "Medium":
                return "bg-orange-100 text-orange-700";
            default:
                return "bg-green-100 text-green-700";
        }
    };

    const completedItems =
        task?.todoChecklist?.filter((item) => item.completed).length || 0;

    const totalItems = task?.todoChecklist?.length || 0;

    const progress =
        totalItems > 0
            ? Math.round((completedItems / totalItems) * 100)
            : task?.progress || 0;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">
                    Loading task details...
                </p>
            </div>
        );
    }

    if (error || !task) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-4xl mx-auto bg-white rounded-xl p-8 text-center">
                    <p className="text-red-600 mb-5">
                        {error || "Task not found."}
                    </p>

                    <button
                        onClick={() => navigate("/user/tasks")}
                        className="bg-blue-600 text-white px-5 py-3 rounded-lg"
                    >
                        Back to My Tasks
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-5 md:p-8">
            <div className="max-w-5xl mx-auto">

                {/* Back button */}
                <button
                    onClick={() => navigate("/user/tasks")}
                    className="text-blue-600 hover:text-blue-800 font-medium mb-6"
                >
                    ← Back to My Tasks
                </button>

                {/* Page heading */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-7">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
                            Task Details
                        </h1>

                        <p className="text-gray-500 mt-2">
                            View the complete information about your assigned task.
                        </p>
                    </div>

                    <button
                        onClick={() => navigate("/user/tasks")}
                        className="border border-gray-300 bg-white hover:bg-gray-50 px-5 py-3 rounded-lg text-sm font-medium"
                    >
                        Close Details
                    </button>
                </div>

                {/* Main task information */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 md:p-8 mb-6">

                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                        <div>
                            <p className="text-sm text-gray-500 mb-2">
                                Task title
                            </p>

                            <h2 className="text-2xl font-semibold text-gray-800">
                                {task.title}
                            </h2>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <span
                                className={`px-4 py-2 rounded-full text-sm font-medium ${getPriorityStyle(task.priority)}`}
                            >
                                {task.priority} Priority
                            </span>

                            <span
                                className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusStyle(task.status)}`}
                            >
                                {task.status}
                            </span>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                        <h3 className="font-semibold text-gray-800 mb-3">
                            Description
                        </h3>

                        <p className="text-gray-600 leading-7 whitespace-pre-wrap">
                            {task.description || "No description provided."}
                        </p>
                    </div>
                </div>

                {/* Task information cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">

                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                        <p className="text-sm text-gray-500">
                            Due Date
                        </p>

                        <p className="text-lg font-semibold text-gray-800 mt-2">
                            {task.dueDate
                                ? new Date(task.dueDate).toLocaleDateString()
                                : "Not specified"}
                        </p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                        <p className="text-sm text-gray-500">
                            Created Date
                        </p>

                        <p className="text-lg font-semibold text-gray-800 mt-2">
                            {task.createdAt
                                ? new Date(task.createdAt).toLocaleDateString()
                                : "Not available"}
                        </p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                        <p className="text-sm text-gray-500">
                            Checklist Progress
                        </p>

                        <p className="text-lg font-semibold text-gray-800 mt-2">
                            {progress}%
                        </p>
                    </div>
                </div>

                {/* Progress section */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">

                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-gray-800">
                            Overall Progress
                        </h3>

                        <span className="text-sm font-semibold text-blue-600">
                            {progress}%
                        </span>
                    </div>

                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-600 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <p className="text-sm text-gray-500 mt-3">
                        {completedItems} of {totalItems} checklist items completed
                    </p>
                </div>

                {/* Assigned members */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">

                    <h3 className="font-semibold text-gray-800 mb-5">
                        Assigned Team Members
                    </h3>

                    {task.assignedTo?.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                            {task.assignedTo.map((member) => (
                                <div
                                    key={member._id}
                                    className="flex items-center gap-3 bg-gray-50 rounded-lg p-4"
                                >
                                    <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold uppercase">
                                        {member.name?.charAt(0) || "U"}
                                    </div>

                                    <div className="min-w-0">
                                        <p className="font-medium text-gray-800">
                                            {member.name}
                                        </p>

                                        <p className="text-sm text-gray-500 break-all">
                                            {member.email}
                                        </p>
                                    </div>
                                </div>
                            ))}

                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">
                            No assigned members found.
                        </p>
                    )}
                </div>

                {/* Checklist */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">

                    <div className="flex justify-between items-center gap-3 mb-5">
                        <h3 className="font-semibold text-gray-800">
                            Task Checklist
                        </h3>

                        <span className="text-sm text-gray-500">
                            {completedItems}/{totalItems} completed
                        </span>
                    </div>

                    {task.todoChecklist?.length > 0 ? (
                        <div className="space-y-3">

                            {task.todoChecklist.map((item, index) => (
                                <div
                                    key={item._id || index}
                                    className="flex items-center gap-3 border-b border-gray-100 pb-3 last:border-0"
                                >
                                    <span
                                        className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold ${
                                            item.completed
                                                ? "bg-green-100 text-green-700"
                                                : "bg-gray-100 text-gray-500"
                                        }`}
                                    >
                                        {item.completed ? "✓" : index + 1}
                                    </span>

                                    <span
                                        className={`text-sm ${
                                            item.completed
                                                ? "line-through text-gray-400"
                                                : "text-gray-700"
                                        }`}
                                    >
                                        {item.text}
                                    </span>
                                </div>
                            ))}

                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">
                            No checklist items added to this task.
                        </p>
                    )}

                    <p className="text-sm text-gray-500 mt-5">
                        To update checklist items, go to My Tasks and use the Checklist action.
                    </p>
                </div>

                {/* Attachments */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">

                    <h3 className="font-semibold text-gray-800 mb-4">
                        Attachments
                    </h3>

                    {task.attachments?.length > 0 ? (
                        <div className="space-y-3">

                            {task.attachments.map((attachment, index) => {
                                const filename = attachment.split("/").pop();

                                return (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between gap-3 bg-gray-50 rounded-lg p-3"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="text-xl">
                                                📎
                                            </span>

                                            <span className="text-sm text-gray-700 break-all">
                                                {filename}
                                            </span>
                                        </div>

                                        <button
                                            onClick={() =>
                                                handleDownloadAttachment(attachment)
                                            }
                                            disabled={downloadingAttachment === filename}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium shrink-0 disabled:opacity-50"
                                        >
                                            {downloadingAttachment === filename
                                                ? "Downloading..."
                                                : "Download"}
                                        </button>
                                    </div>
                                );
                            })}

                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">
                            No attachments available.
                        </p>
                    )}

                </div>

            </div>
        </div>
    );
};

export default ViewTaskDetails;
