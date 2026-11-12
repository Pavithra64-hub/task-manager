
import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import API_PATHS from "../../utils/apiPaths";

const ManageTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Search and filters
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [priorityFilter, setPriorityFilter] = useState("All");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    // Edit modal
    const [editingTask, setEditingTask] = useState(null);
    const [editForm, setEditForm] = useState({
        title: "",
        description: "",
        priority: "Medium",
        dueDate: "",
    });
    const [saving, setSaving] = useState(false);

    // Attachment upload
    const [uploadingTaskId, setUploadingTaskId] = useState("");
    const [uploadError, setUploadError] = useState("");

    // Fetch all tasks
    const fetchTasks = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axiosInstance.get(
                API_PATHS.TASKS.GET_ALL
            );

            setTasks(response.data.tasks || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load tasks."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    // Upload attachments
    const handleAttachmentUpload = async (taskId, e) => {
        const files = Array.from(e.target.files || []);

        // Reset input so the same file can be selected again
        e.target.value = "";

        if (files.length === 0) return;

        if (files.length > 5) {
            setUploadError("You can upload a maximum of 5 files at once.");
            return;
        }

        const maxFileSize = 5 * 1024 * 1024;

        const oversizedFile = files.find(
            (file) => file.size > maxFileSize
        );

        if (oversizedFile) {
            setUploadError(
                `${oversizedFile.name} exceeds the 5 MB file size limit.`
            );
            return;
        }

        const formData = new FormData();

        files.forEach((file) => {
            formData.append("attachments", file);
        });

        try {
            setUploadingTaskId(taskId);
            setUploadError("");

            const response = await axiosInstance.post(
                `/tasks/${taskId}/attachments`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            alert(
                response.data.message ||
                "Attachments uploaded successfully."
            );

            await fetchTasks();
        } catch (err) {
            const message =
                err.response?.data?.message ||
                err.response?.data ||
                err.message ||
                "Unable to upload attachments.";

            setUploadError(
                typeof message === "string"
                    ? message
                    : "Unable to upload attachments."
            );
        } finally {
            setUploadingTaskId("");
        }
    };

    // Search and filter tasks
    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const matchesSearch =
                task.title?.toLowerCase().includes(search.toLowerCase()) ||
                task.description?.toLowerCase().includes(search.toLowerCase());

            const matchesStatus =
                statusFilter === "All" || task.status === statusFilter;

            const matchesPriority =
                priorityFilter === "All" ||
                task.priority === priorityFilter;

            return matchesSearch && matchesStatus && matchesPriority;
        });
    }, [tasks, search, statusFilter, priorityFilter]);

    // Pagination
    const totalPages = Math.max(
        1,
        Math.ceil(filteredTasks.length / pageSize)
    );

    const paginatedTasks = filteredTasks.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, priorityFilter, pageSize]);

    // Open edit modal
    const handleEdit = (task) => {
        setEditingTask(task);

        setEditForm({
            title: task.title || "",
            description: task.description || "",
            priority: task.priority || "Medium",
            dueDate: task.dueDate
                ? new Date(task.dueDate).toISOString().split("T")[0]
                : "",
        });
    };

    // Update form fields
    const handleEditChange = (e) => {
        const { name, value } = e.target;

        setEditForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // Save edited task
    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!editForm.title.trim() || !editForm.dueDate) {
            alert("Task title and due date are required.");
            return;
        }

        try {
            setSaving(true);

            await axiosInstance.put(
                API_PATHS.TASKS.UPDATE(editingTask._id),
                {
                    title: editForm.title.trim(),
                    description: editForm.description,
                    priority: editForm.priority,
                    dueDate: editForm.dueDate,
                }
            );

            setEditingTask(null);
            await fetchTasks();
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Unable to update task."
            );
        } finally {
            setSaving(false);
        }
    };

    // Delete task
    const handleDelete = async (taskId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this task?"
        );

        if (!confirmed) return;

        try {
            await axiosInstance.delete(
                API_PATHS.TASKS.DELETE(taskId)
            );

            await fetchTasks();
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Unable to delete task."
            );
        }
    };

    // Status badge colors
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

    // Priority badge colors
    const getPriorityStyle = (priority) => {
        switch (priority) {
            case "High":
                return "bg-red-100 text-red-700";
            case "Low":
                return "bg-green-100 text-green-700";
            default:
                return "bg-orange-100 text-orange-700";
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-500">Loading tasks...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full min-w-0 bg-gray-50 p-5 md:p-8">

            {/* Page heading */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
                        Manage Tasks
                    </h1>

                    <p className="text-gray-500 mt-2">
                        View, search, edit and manage all your tasks.
                    </p>
                </div>

                <button
                    onClick={fetchTasks}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg text-sm font-medium"
                >
                    Refresh Tasks
                </button>
            </div>

            {/* Error message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {/* Attachment upload error */}
            {uploadError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 flex justify-between gap-3">
                    <span>{uploadError}</span>
                    <button
                        onClick={() => setUploadError("")}
                        className="font-semibold"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Task summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">

                {[
                    {
                        label: "Total Tasks",
                        value: tasks.length,
                        color: "text-blue-600",
                    },
                    {
                        label: "Pending",
                        value: tasks.filter(t => t.status === "Pending").length,
                        color: "text-yellow-600",
                    },
                    {
                        label: "In Progress",
                        value: tasks.filter(t => t.status === "In Progress").length,
                        color: "text-indigo-600",
                    },
                    {
                        label: "Completed",
                        value: tasks.filter(t => t.status === "Completed").length,
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

            {/* Search and filters */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    {/* Search */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search tasks
                        </label>

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by title or description..."
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Status filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Filter by status
                        </label>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white outline-none focus:border-blue-500"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>

                    {/* Priority filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Filter by priority
                        </label>

                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white outline-none focus:border-blue-500"
                        >
                            <option value="All">All Priorities</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>

                </div>
            </div>

            {/* Tasks table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

                <div className="p-5 md:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">
                            All Tasks
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            {filteredTasks.length} task(s) found
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Show</span>

                        <select
                            value={pageSize}
                            onChange={(e) => setPageSize(Number(e.target.value))}
                            className="border border-gray-300 rounded-md px-2 py-1 bg-white"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                        </select>

                        <span>entries</span>
                    </div>
                </div>

                {paginatedTasks.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500 font-medium">
                            No tasks found.
                        </p>

                        <p className="text-sm text-gray-400 mt-2">
                            Try changing your search or filters.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px] text-left">

                            <thead className="bg-gray-50 text-gray-500 text-sm">
                                <tr>
                                    <th className="px-5 py-4">Task</th>
                                    <th className="px-5 py-4">Assigned To</th>
                                    <th className="px-5 py-4">Priority</th>
                                    <th className="px-5 py-4">Status</th>
                                    <th className="px-5 py-4">Due Date</th>
                                    <th className="px-5 py-4">Attachments</th>
                                    <th className="px-5 py-4">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {paginatedTasks.map((task) => (
                                    <tr
                                        key={task._id}
                                        className="border-t border-gray-100 hover:bg-gray-50"
                                    >
                                        <td className="px-5 py-4">
                                            <p className="font-medium text-gray-800">
                                                {task.title}
                                            </p>

                                            <p className="text-xs text-gray-400 mt-1 max-w-[200px] truncate">
                                                {task.description || "No description"}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {task.assignedTo?.length > 0 ? (
                                                    task.assignedTo.map((member) => (
                                                        <span
                                                            key={member._id}
                                                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                                                        >
                                                            {member.name}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-gray-400">
                                                        Unassigned
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-5 py-4">
                                            <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${getPriorityStyle(task.priority)}`}>
                                                {task.priority}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${getStatusStyle(task.status)}`}>
                                                {task.status}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4 text-sm text-gray-600">
                                            {task.dueDate
                                                ? new Date(task.dueDate).toLocaleDateString()
                                                : "No date"}
                                        </td>

                                        {/* Attachment upload */}
                                        <td className="px-5 py-4">
                                            <div className="flex flex-col gap-2">
                                                <span className="text-xs text-gray-500">
                                                    {task.attachments?.length || 0} file(s)
                                                </span>

                                                <label
                                                    className={`inline-flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
                                                        uploadingTaskId === task._id
                                                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                                            : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                                                    }`}
                                                >
                                                    {uploadingTaskId === task._id
                                                        ? "Uploading..."
                                                        : "＋ Upload"}

                                                    <input
                                                        type="file"
                                                        multiple
                                                        accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                                                        className="hidden"
                                                        disabled={uploadingTaskId === task._id}
                                                        onChange={(e) =>
                                                            handleAttachmentUpload(task._id, e)
                                                        }
                                                    />
                                                </label>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(task)}
                                                    className="text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md text-sm font-medium"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(task._id)}
                                                    className="text-red-600 hover:bg-red-50 px-3 py-2 rounded-md text-sm font-medium"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>
                )}

                {/* Pagination */}
                <div className="p-5 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">

                    <p className="text-sm text-gray-500">
                        Showing {filteredTasks.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                        {" "}to{" "}
                        {Math.min(currentPage * pageSize, filteredTasks.length)}
                        {" "}of {filteredTasks.length} tasks
                    </p>

                    <div className="flex items-center gap-2">

                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((page) => page - 1)}
                            className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
                        >
                            Previous
                        </button>

                        <span className="text-sm text-gray-600">
                            Page {currentPage} of {totalPages}
                        </span>

                        <button
                            disabled={currentPage >= totalPages}
                            onClick={() => setCurrentPage((page) => page + 1)}
                            className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
                        >
                            Next
                        </button>

                    </div>
                </div>

            </div>

            {/* Edit Task Modal */}
            {editingTask && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">

                    <div className="bg-white w-full max-w-lg rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">

                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-800">
                                Edit Task
                            </h2>

                            <button
                                onClick={() => setEditingTask(null)}
                                className="text-gray-500 hover:text-gray-800 text-2xl"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="p-6 space-y-4">

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Task title
                                </label>

                                <input
                                    type="text"
                                    name="title"
                                    value={editForm.title}
                                    onChange={handleEditChange}
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    value={editForm.description}
                                    onChange={handleEditChange}
                                    rows={4}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Priority
                                </label>

                                <select
                                    name="priority"
                                    value={editForm.priority}
                                    onChange={handleEditChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white"
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Due date
                                </label>

                                <input
                                    type="date"
                                    name="dueDate"
                                    value={editForm.dueDate}
                                    onChange={handleEditChange}
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setEditingTask(null)}
                                    className="px-5 py-3 border rounded-lg text-sm"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm disabled:opacity-60"
                                >
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ManageTasks;
