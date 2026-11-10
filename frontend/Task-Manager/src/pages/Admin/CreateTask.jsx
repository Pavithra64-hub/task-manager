
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import API_PATHS from "../../utils/apiPaths";

const CreateTask = () => {
    const navigate = useNavigate();

    // Form data
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        priority: "Medium",
        dueDate: "",
        assignedTo: [],
    });

    // Team members
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);

    // Checklist
    const [todoChecklist, setTodoChecklist] = useState([]);
    const [newChecklistItem, setNewChecklistItem] = useState("");

    // Submission states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Fetch team members when page opens
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axiosInstance.get(
                    API_PATHS.USERS.GET_ALL
                );

                // Backend returns an array of member objects
                setUsers(Array.isArray(response.data) ? response.data : []);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Unable to load team members."
                );
            } finally {
                setLoadingUsers(false);
            }
        };

        fetchUsers();
    }, []);

    // Handle normal form inputs
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // Select or deselect a team member
    const handleUserSelection = (userId) => {
        setFormData((previous) => {
            const alreadySelected = previous.assignedTo.includes(userId);

            return {
                ...previous,
                assignedTo: alreadySelected
                    ? previous.assignedTo.filter((id) => id !== userId)
                    : [...previous.assignedTo, userId],
            };
        });
    };

    // Add checklist item
    const handleAddChecklist = () => {
        const text = newChecklistItem.trim();

        if (!text) return;

        setTodoChecklist((previous) => [
            ...previous,
            {
                text,
                completed: false,
            },
        ]);

        setNewChecklistItem("");
    };

    // Remove checklist item
    const handleRemoveChecklist = (indexToRemove) => {
        setTodoChecklist((previous) =>
            previous.filter((_, index) => index !== indexToRemove)
        );
    };

    // Submit task to backend
    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!formData.title.trim()) {
            setError("Please enter a task title.");
            return;
        }

        if (!formData.dueDate) {
            setError("Please select a due date.");
            return;
        }

        if (formData.assignedTo.length === 0) {
            setError("Please assign the task to at least one member.");
            return;
        }

        try {
            setLoading(true);

            const taskData = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                priority: formData.priority,
                dueDate: formData.dueDate,
                assignedTo: formData.assignedTo,
                todoChecklist,
                attachments: [],
            };

            const response = await axiosInstance.post(
                API_PATHS.TASKS.CREATE,
                taskData
            );

            setSuccess(
                response.data.message || "Task created successfully!"
            );

            // Clear form after successful creation
            setFormData({
                title: "",
                description: "",
                priority: "Medium",
                dueDate: "",
                assignedTo: [],
            });

            setTodoChecklist([]);
            setNewChecklistItem("");

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to create task. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full min-w-0 bg-gray-50 p-5 md:p-8">

            {/* Page heading */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
                    Create New Task
                </h1>

                <p className="text-gray-500 mt-2">
                    Create a task and assign it to your team members.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-4xl">

                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 md:p-8 space-y-7">

                    {/* Error message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Success message */}
                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                            {success}
                            <button
                                type="button"
                                onClick={() => navigate("/admin/tasks")}
                                className="ml-3 underline font-semibold"
                            >
                                View Tasks
                            </button>
                        </div>
                    )}

                    {/* Task title */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Task Title *
                        </label>

                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Enter task title"
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Description
                        </label>

                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe the task and its requirements..."
                            rows={5}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 resize-y"
                        />
                    </div>

                    {/* Priority and due date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Priority *
                            </label>

                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white outline-none focus:border-blue-500"
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Due Date *
                            </label>

                            <input
                                type="date"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
                            />
                        </div>

                    </div>

                    {/* Assign team members */}
                    <div>
                        <div className="mb-3">
                            <label className="block text-sm font-semibold text-gray-700">
                                Assign Team Members *
                            </label>

                            <p className="text-xs text-gray-500 mt-1">
                                Select one or more members for this task.
                            </p>
                        </div>

                        {loadingUsers ? (
                            <p className="text-sm text-gray-500">
                                Loading team members...
                            </p>
                        ) : users.length === 0 ? (
                            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg text-sm">
                                No team members found. Register a member account before creating a task.
                            </div>
                        ) : (
                            <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-64 overflow-y-auto">

                                {users.map((user) => (
                                    <label
                                        key={user._id}
                                        className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.assignedTo.includes(user._id)}
                                            onChange={() =>
                                                handleUserSelection(user._id)
                                            }
                                            className="w-4 h-4 accent-blue-600"
                                        />

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800">
                                                {user.name}
                                            </p>

                                            <p className="text-xs text-gray-500">
                                                {user.email}
                                            </p>
                                        </div>

                                        {formData.assignedTo.includes(user._id) && (
                                            <span className="text-xs text-blue-600 font-medium">
                                                Selected
                                            </span>
                                        )}
                                    </label>
                                ))}

                            </div>
                        )}

                        <p className="text-xs text-gray-500 mt-2">
                            {formData.assignedTo.length} member(s) selected
                        </p>
                    </div>

                    {/* Checklist */}
                    <div>
                        <div className="mb-3">
                            <label className="block text-sm font-semibold text-gray-700">
                                Task Checklist
                            </label>

                            <p className="text-xs text-gray-500 mt-1">
                                Break the task into smaller steps.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">

                            <input
                                type="text"
                                value={newChecklistItem}
                                onChange={(e) =>
                                    setNewChecklistItem(e.target.value)
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleAddChecklist();
                                    }
                                }}
                                placeholder="Enter a checklist item"
                                className="flex-1 min-w-0 border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
                            />

                            <button
                                type="button"
                                onClick={handleAddChecklist}
                                className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-lg font-medium"
                            >
                                Add Item
                            </button>

                        </div>

                        {todoChecklist.length > 0 && (
                            <div className="mt-4 space-y-2">

                                {todoChecklist.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="text-xs text-gray-400">
                                                {index + 1}.
                                            </span>

                                            <span className="text-sm text-gray-700 break-words">
                                                {item.text}
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemoveChecklist(index)
                                            }
                                            className="text-red-600 hover:text-red-800 text-sm font-medium shrink-0"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}

                            </div>
                        )}

                        {todoChecklist.length === 0 && (
                            <p className="text-sm text-gray-400 mt-3">
                                No checklist items added yet.
                            </p>
                        )}
                    </div>

                    {/* Form buttons */}
                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-gray-100 pt-6">

                        <button
                            type="button"
                            onClick={() => navigate("/admin/tasks")}
                            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading || loadingUsers || users.length === 0}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Creating Task..." : "Create Task"}
                        </button>

                    </div>

                </div>
            </form>
        </div>
    );
};

export default CreateTask;
