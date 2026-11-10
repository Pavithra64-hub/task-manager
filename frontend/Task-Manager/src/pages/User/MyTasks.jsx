
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import API_PATHS from "../../utils/apiPaths";

const MyTasks = () => {
    const navigate = useNavigate();

    const [tasks, setTasks] = useState([]);
    const [statusSummary, setStatusSummary] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [priorityFilter, setPriorityFilter] = useState("All");
    const [pageSize, setPageSize] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedTask, setExpandedTask] = useState(null);
    const [updatingTask, setUpdatingTask] = useState(null);

    // Fetch tasks assigned to the logged-in member
    const fetchTasks = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axiosInstance.get(
                API_PATHS.TASKS.GET_ALL
            );

            setTasks(response.data.tasks || []);
            setStatusSummary(response.data.statusSummary || {});
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load your tasks."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    // Search and filter tasks
    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const searchText = search.toLowerCase().trim();

            const matchesSearch =
                task.title?.toLowerCase().includes(searchText) ||
                task.description?.toLowerCase().includes(searchText);

            const matchesStatus =
                statusFilter === "All" ||
                task.status === statusFilter;

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

    const displayedTasks = filteredTasks.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    // Change task status
    const handleStatusChange = async (taskId, newStatus) => {
        try {
            setUpdatingTask(taskId);
            setError("");

            await axiosInstance.put(
                API_PATHS.TASKS.UPDATE_STATUS(taskId),
                { status: newStatus }
            );

            await fetchTasks();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to update task status."
            );
        } finally {
            setUpdatingTask(null);
        }
    };

    // Update a checklist item
    const handleChecklistChange = async (
        task,
        checklistIndex,
        checked
    ) => {
        const updatedChecklist = task.todoChecklist.map(
            (item, index) =>
                index === checklistIndex
                    ? { ...item, completed: checked }
                    : item
        );

        try {
            setUpdatingTask(task._id);
            setError("");

            await axiosInstance.put(
                API_PATHS.TASKS.UPDATE_TODO(task._id),
                { todoChecklist: updatedChecklist }
            );

            await fetchTasks();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to update checklist."
            );
        } finally {
            setUpdatingTask(null);
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

    const getProgress = (task) => {
        if (!task.todoChecklist?.length) {
            return task.progress || 0;
        }

        const completed = task.todoChecklist.filter(
            (item) => item.completed
        ).length;

        return Math.round(
            (completed / task.todoChecklist.length) * 100
        );
    };

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, priorityFilter, pageSize]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Loading your tasks...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full min-w-0 bg-gray-50 p-5 md:p-8">

            {/* Heading */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
                        My Tasks
                    </h1>

                    <p className="text-gray-500 mt-2">
                        View and manage the tasks assigned to you.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={fetchTasks}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg text-sm font-medium"
                >
                    Refresh Tasks
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">

                {[
                    {
                        title: "Total Tasks",
                        value: statusSummary.all || 0,
                        color: "text-blue-600",
                    },
                    {
                        title: "Pending",
                        value: statusSummary.pendingTasks || 0,
                        color: "text-yellow-600",
                    },
                    {
                        title: "In Progress",
                        value: statusSummary.inProgressTasks || 0,
                        color: "text-indigo-600",
                    },
                    {
                        title: "Completed",
                        value: statusSummary.completedTasks || 0,
                        color: "text-green-600",
                    },
                ].map((item) => (
                    <div
                        key={item.title}
                        className="bg-white border border-gray-100 rounded-xl shadow-sm p-5"
                    >
                        <p className="text-sm text-gray-500">
                            {item.title}
                        </p>

                        <h2 className={`text-3xl font-bold mt-3 ${item.color}`}>
                            {item.value}
                        </h2>
                    </div>
                ))}

            </div>

            {/* Search and filters */}
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 mb-6">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

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

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Filter by status
                        </label>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Filter by priority
                        </label>

                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white"
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
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">

                <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">
                            Assigned Tasks
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            {filteredTasks.length} task(s) found
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        Show

                        <select
                            value={pageSize}
                            onChange={(e) => setPageSize(Number(e.target.value))}
                            className="border border-gray-300 rounded-md p-2 bg-white"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                        </select>

                        entries
                    </div>
                </div>

                {displayedTasks.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        No tasks match your search or filters.
                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[850px] text-left">

                            <thead className="bg-gray-50 text-gray-500 text-sm">
                                <tr>
                                    <th className="px-5 py-4">Task</th>
                                    <th className="px-5 py-4">Priority</th>
                                    <th className="px-5 py-4">Due Date</th>
                                    <th className="px-5 py-4">Progress</th>
                                    <th className="px-5 py-4">Status</th>
                                    <th className="px-5 py-4">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {displayedTasks.map((task) => {
                                    const progress = getProgress(task);
                                    const isExpanded = expandedTask === task._id;

                                    return (
                                        <React.Fragment key={task._id}>

                                            <tr className="border-t border-gray-100 hover:bg-gray-50">

                                                <td className="px-5 py-4">
                                                    <p className="font-medium text-gray-800">
                                                        {task.title}
                                                    </p>

                                                    <p className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                                                        {task.description}
                                                    </p>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getPriorityStyle(task.priority)}`}>
                                                        {task.priority}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4 text-sm text-gray-600">
                                                    {task.dueDate
                                                        ? new Date(task.dueDate).toLocaleDateString()
                                                        : "No due date"}
                                                </td>

                                                <td className="px-5 py-4 min-w-32">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-blue-600 rounded-full"
                                                                style={{ width: `${progress}%` }}
                                                            />
                                                        </div>

                                                        <span className="text-xs text-gray-600">
                                                            {progress}%
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <select
                                                        value={task.status}
                                                        disabled={updatingTask === task._id}
                                                        onChange={(e) =>
                                                            handleStatusChange(
                                                                task._id,
                                                                e.target.value
                                                            )
                                                        }
                                                        className={`border-0 rounded-full px-3 py-2 text-xs font-medium outline-none ${getStatusStyle(task.status)} disabled:opacity-50`}
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="In Progress">In Progress</option>
                                                        <option value="Completed">Completed</option>
                                                    </select>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setExpandedTask(
                                                                    isExpanded ? null : task._id
                                                                )
                                                            }
                                                            className="text-blue-600 hover:underline text-sm font-medium"
                                                        >
                                                            {isExpanded ? "Hide" : "Checklist"}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                navigate(`/user/task-details/${task._id}`)
                                                            }
                                                            className="text-gray-700 hover:underline text-sm font-medium"
                                                        >
                                                            Details
                                                        </button>
                                                    </div>
                                                </td>

                                            </tr>

                                            {/* Expandable checklist */}
                                            {isExpanded && (
                                                <tr className="bg-gray-50 border-t border-gray-100">
                                                    <td colSpan="6" className="px-5 py-5">

                                                        <div className="max-w-2xl">
                                                            <h3 className="font-semibold text-gray-800 mb-3">
                                                                Task Checklist
                                                            </h3>

                                                            {task.todoChecklist?.length > 0 ? (
                                                                <div className="space-y-3">
                                                                    {task.todoChecklist.map((item, index) => (
                                                                        <label
                                                                            key={item._id || index}
                                                                            className="flex items-center gap-3 text-sm text-gray-700"
                                                                        >
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={item.completed}
                                                                                disabled={updatingTask === task._id}
                                                                                onChange={(e) =>
                                                                                    handleChecklistChange(
                                                                                        task,
                                                                                        index,
                                                                                        e.target.checked
                                                                                    )
                                                                                }
                                                                                className="w-4 h-4 accent-blue-600"
                                                                            />

                                                                            <span className={item.completed ? "line-through text-gray-400" : ""}>
                                                                                {item.text}
                                                                            </span>
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <p className="text-sm text-gray-500">
                                                                    No checklist items for this task.
                                                                </p>
                                                            )}

                                                        </div>
                                                    </td>
                                                </tr>
                                            )}

                                        </React.Fragment>
                                    );
                                })}
                            </tbody>

                        </table>
                    </div>
                )}

                {/* Pagination */}
                <div className="p-5 border-t border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">

                    <p className="text-sm text-gray-500">
                        {filteredTasks.length === 0
                            ? "Showing 0 tasks"
                            : `Showing ${(currentPage - 1) * pageSize + 1} to ${Math.min(
                                currentPage * pageSize,
                                filteredTasks.length
                            )} of ${filteredTasks.length} tasks`}
                    </p>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((page) => page - 1)}
                            className="border border-gray-300 rounded-lg px-4 py-2 text-sm disabled:opacity-40"
                        >
                            Previous
                        </button>

                        <span className="text-sm text-gray-600">
                            Page {currentPage} of {totalPages}
                        </span>

                        <button
                            type="button"
                            disabled={currentPage >= totalPages}
                            onClick={() => setCurrentPage((page) => page + 1)}
                            className="border border-gray-300 rounded-lg px-4 py-2 text-sm disabled:opacity-40"
                        >
                            Next
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default MyTasks;
