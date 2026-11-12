
const mongoose = require("mongoose");
const Task = require("../models/Task");
const fs = require("fs");
const path = require("path");

// -------------------- HELPER FUNCTIONS --------------------

// Validate MongoDB IDs before querying.
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Handle both populated users and raw ObjectIds.
const isAssignedToUser = (task, userId) => {
    return task.assignedTo.some((member) => {
        const assignedId = member?._id || member;
        return assignedId?.toString() === userId.toString();
    });
};

// Admins can access every task; members can access assigned tasks only.
const canAccessTask = (task, user) => {
    return (
        user.role === "admin" ||
        isAssignedToUser(task, user._id)
    );
};

const removeUploadedFiles = (files = []) => {
    files.forEach((file) => {
        const filePath = path.join(
            __dirname,
            "../uploads",
            path.basename(file.filename)
        );

        fs.unlink(filePath, () => {});
    });
};

const validPriorities = ["Low", "Medium", "High"];
const validStatuses = ["Pending", "In Progress", "Completed"];

// -------------------- GET ALL TASKS --------------------

// @route GET /api/tasks/
// @access Private
const getTasks = async (req, res) => {
    try {
        const { status } = req.query;

        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid task status.",
            });
        }

        const filter = {};

        if (status) {
            filter.status = status;
        }

        if (req.user.role !== "admin") {
            filter.assignedTo = req.user._id;
        }

        const tasks = await Task.find(filter)
            .populate("assignedTo", "name email profileImageUrl")
            .sort({ createdAt: -1 });

        const formattedTasks = tasks.map((task) => {
            const completedTodoCount = task.todoChecklist.filter(
                (item) => item.completed
            ).length;

            return {
                ...task.toObject(),
                completedTodoCount,
            };
        });

        const accessFilter =
            req.user.role === "admin"
                ? {}
                : { assignedTo: req.user._id };

        const [allTasks, pendingTasks, inProgressTasks, completedTasks] =
            await Promise.all([
                Task.countDocuments(accessFilter),
                Task.countDocuments({
                    ...accessFilter,
                    status: "Pending",
                }),
                Task.countDocuments({
                    ...accessFilter,
                    status: "In Progress",
                }),
                Task.countDocuments({
                    ...accessFilter,
                    status: "Completed",
                }),
            ]);

        return res.status(200).json({
            tasks: formattedTasks,
            statusSummary: {
                all: allTasks,
                pendingTasks,
                inProgressTasks,
                completedTasks,
            },
        });
    } catch (error) {
        console.error("Get tasks error:", error);

        return res.status(500).json({
            message: "Unable to fetch tasks.",
        });
    }
};

// -------------------- GET TASK BY ID --------------------

// @route GET /api/tasks/:id
// @access Private
const getTaskById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                message: "Invalid task ID.",
            });
        }

        const task = await Task.findById(id).populate(
            "assignedTo",
            "name email profileImageUrl"
        );

        if (!task) {
            return res.status(404).json({
                message: "Task not found.",
            });
        }

        if (!canAccessTask(task, req.user)) {
            return res.status(403).json({
                message: "You are not authorized to access this task.",
            });
        }

        return res.status(200).json(task);
    } catch (error) {
        console.error("Get task by ID error:", error);

        return res.status(500).json({
            message: "Unable to fetch task.",
        });
    }
};

// -------------------- CREATE TASK --------------------

// @route POST /api/tasks/
// @access Admin only
const createTask = async (req, res) => {
    try {
        const {
            title,
            description,
            priority,
            dueDate,
            assignedTo,
            todoChecklist,
        } = req.body;

        if (!title || typeof title !== "string" || !title.trim()) {
            return res.status(400).json({
                message: "Task title is required.",
            });
        }

        if (!dueDate || Number.isNaN(Date.parse(dueDate))) {
            return res.status(400).json({
                message: "A valid due date is required.",
            });
        }

        if (
            priority !== undefined &&
            !validPriorities.includes(priority)
        ) {
            return res.status(400).json({
                message: "Invalid task priority.",
            });
        }

        if (!Array.isArray(assignedTo)) {
            return res.status(400).json({
                message: "assignedTo must be an array of user IDs.",
            });
        }

        if (!assignedTo.every(isValidId)) {
            return res.status(400).json({
                message: "One or more assigned user IDs are invalid.",
            });
        }

        if (
            todoChecklist !== undefined &&
            !Array.isArray(todoChecklist)
        ) {
            return res.status(400).json({
                message: "todoChecklist must be an array.",
            });
        }

        const task = await Task.create({
            title: title.trim(),
            description:
                typeof description === "string" ? description.trim() : "",
            priority: priority || "Medium",
            dueDate: new Date(dueDate),
            assignedTo,
            todoChecklist: todoChecklist || [],
            attachments: [],
            createdBy: req.user._id,
        });

        const createdTask = await Task.findById(task._id).populate(
            "assignedTo",
            "name email profileImageUrl"
        );

        return res.status(201).json({
            message: "Task created successfully.",
            task: createdTask,
        });
    } catch (error) {
        console.error("Create task error:", error);

        return res.status(500).json({
            message: "Unable to create task.",
        });
    }
};

// -------------------- UPDATE TASK --------------------

// @route PUT /api/tasks/:id
// @access Admin only
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                message: "Invalid task ID.",
            });
        }

        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found.",
            });
        }

        const {
            title,
            description,
            priority,
            dueDate,
            assignedTo,
            todoChecklist,
        } = req.body;

        // Validate only fields supplied by the client.
        if (title !== undefined) {
            if (typeof title !== "string" || !title.trim()) {
                return res.status(400).json({
                    message: "Task title cannot be empty.",
                });
            }

            task.title = title.trim();
        }

        if (description !== undefined) {
            if (typeof description !== "string") {
                return res.status(400).json({
                    message: "Description must be text.",
                });
            }

            task.description = description.trim();
        }

        if (priority !== undefined) {
            if (!validPriorities.includes(priority)) {
                return res.status(400).json({
                    message: "Invalid task priority.",
                });
            }

            task.priority = priority;
        }

        if (dueDate !== undefined) {
            if (!dueDate || Number.isNaN(Date.parse(dueDate))) {
                return res.status(400).json({
                    message: "Invalid due date.",
                });
            }

            task.dueDate = new Date(dueDate);
        }

        if (assignedTo !== undefined) {
            if (
                !Array.isArray(assignedTo) ||
                !assignedTo.every(isValidId)
            ) {
                return res.status(400).json({
                    message: "assignedTo must contain valid user IDs.",
                });
            }

            task.assignedTo = assignedTo;
        }

        if (todoChecklist !== undefined) {
            if (!Array.isArray(todoChecklist)) {
                return res.status(400).json({
                    message: "todoChecklist must be an array.",
                });
            }

            task.todoChecklist = todoChecklist;

            const completedCount = todoChecklist.filter(
                (item) => item.completed
            ).length;

            task.progress =
                todoChecklist.length > 0
                    ? Math.round(
                          (completedCount / todoChecklist.length) * 100
                      )
                    : 0;

            if (task.progress === 100 && todoChecklist.length > 0) {
                task.status = "Completed";
            } else if (task.progress > 0) {
                task.status = "In Progress";
            } else {
                task.status = "Pending";
            }
        }

        // Attachments are intentionally not editable through this route.
        // Use the dedicated attachment upload endpoint instead.

        await task.save();

        const updatedTask = await Task.findById(id).populate(
            "assignedTo",
            "name email profileImageUrl"
        );

        return res.status(200).json({
            message: "Task updated successfully.",
            updatedTask,
        });
    } catch (error) {
        console.error("Update task error:", error);

        return res.status(500).json({
            message: "Unable to update task.",
        });
    }
};

// -------------------- DELETE TASK --------------------

// @route DELETE /api/tasks/:id
// @access Admin only
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                message: "Invalid task ID.",
            });
        }

        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found.",
            });
        }

        // Remove attachment files when deleting the task.
        const uploadDirectory = path.resolve(
            __dirname,
            "../uploads"
        );

        task.attachments.forEach((attachment) => {
            const filename = path.basename(attachment);
            const filePath = path.resolve(
                uploadDirectory,
                filename
            );

            if (
                filePath.startsWith(uploadDirectory + path.sep) &&
                fs.existsSync(filePath)
            ) {
                fs.unlink(filePath, () => {});
            }
        });

        await task.deleteOne();

        return res.status(200).json({
            message: "Task deleted successfully.",
        });
    } catch (error) {
        console.error("Delete task error:", error);

        return res.status(500).json({
            message: "Unable to delete task.",
        });
    }
};

// -------------------- UPDATE TASK STATUS --------------------

// @route PUT /api/tasks/:id/status
// @access Admin or assigned member
const updateTaskStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!isValidId(id)) {
            return res.status(400).json({
                message: "Invalid task ID.",
            });
        }

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid task status.",
            });
        }

        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found.",
            });
        }

        if (!canAccessTask(task, req.user)) {
            return res.status(403).json({
                message: "You are not authorized to update this task.",
            });
        }

        task.status = status;

        if (status === "Completed") {
            task.todoChecklist.forEach((item) => {
                item.completed = true;
            });

            task.progress = 100;
        } else if (status === "Pending") {
            task.todoChecklist.forEach((item) => {
                item.completed = false;
            });

            task.progress = 0;
        } else if (status === "In Progress" && task.progress === 100) {
            task.progress = 0;
            task.todoChecklist.forEach((item) => {
                item.completed = false;
            });
        }

        await task.save();

        const updatedTask = await Task.findById(id).populate(
            "assignedTo",
            "name email profileImageUrl"
        );

        return res.status(200).json({
            message: "Task status updated successfully.",
            task: updatedTask,
        });
    } catch (error) {
        console.error("Update task status error:", error);

        return res.status(500).json({
            message: "Unable to update task status.",
        });
    }
};

// -------------------- UPDATE TASK CHECKLIST --------------------

// @route PUT /api/tasks/:id/todo
// @access Admin or assigned member
const updateTaskChecklist = async (req, res) => {
    try {
        const { id } = req.params;
        const { todoChecklist } = req.body;

        if (!isValidId(id)) {
            return res.status(400).json({
                message: "Invalid task ID.",
            });
        }

        if (!Array.isArray(todoChecklist)) {
            return res.status(400).json({
                message: "todoChecklist must be an array.",
            });
        }

        const validChecklist = todoChecklist.every(
            (item) =>
                item &&
                typeof item.text === "string" &&
                item.text.trim() &&
                typeof item.completed === "boolean"
        );

        if (!validChecklist) {
            return res.status(400).json({
                message: "Each checklist item needs text and a completed value.",
            });
        }

        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found.",
            });
        }

        if (!canAccessTask(task, req.user)) {
            return res.status(403).json({
                message: "You are not authorized to update this checklist.",
            });
        }

        task.todoChecklist = todoChecklist;

        const completedCount = todoChecklist.filter(
            (item) => item.completed
        ).length;

        task.progress =
            todoChecklist.length > 0
                ? Math.round(
                      (completedCount / todoChecklist.length) * 100
                  )
                : 0;

        if (task.progress === 100 && todoChecklist.length > 0) {
            task.status = "Completed";
        } else if (task.progress > 0) {
            task.status = "In Progress";
        } else {
            task.status = "Pending";
        }

        await task.save();

        const updatedTask = await Task.findById(id).populate(
            "assignedTo",
            "name email profileImageUrl"
        );

        return res.status(200).json({
            message: "Task checklist updated successfully.",
            task: updatedTask,
        });
    } catch (error) {
        console.error("Update checklist error:", error);

        return res.status(500).json({
            message: "Unable to update task checklist.",
        });
    }
};

// -------------------- ADMIN DASHBOARD --------------------

// @route GET /api/tasks/dashboard-data
// @access Admin only
const getDashboardData = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Only administrators can access this dashboard.",
            });
        }

        const [
            totalTasks,
            pendingTasks,
            completedTasks,
            overdueTasks,
            taskDistributionRaw,
            taskPriorityLevelsRaw,
            recentTasks,
        ] = await Promise.all([
            Task.countDocuments(),
            Task.countDocuments({ status: "Pending" }),
            Task.countDocuments({ status: "Completed" }),
            Task.countDocuments({
                status: { $ne: "Completed" },
                dueDate: { $lt: new Date() },
            }),
            Task.aggregate([
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 },
                    },
                },
            ]),
            Task.aggregate([
                {
                    $group: {
                        _id: "$priority",
                        count: { $sum: 1 },
                    },
                },
            ]),
            Task.find()
                .sort({ createdAt: -1 })
                .limit(10)
                .select("title status priority dueDate createdAt"),
        ]);

        const taskStatuses = [
            "Pending",
            "In Progress",
            "Completed",
        ];

        const taskDistribution = taskStatuses.reduce(
            (acc, status) => {
                const key = status.replace(/\s+/g, "");

                acc[key] =
                    taskDistributionRaw.find(
                        (item) => item._id === status
                    )?.count || 0;

                return acc;
            },
            {}
        );

        const taskPriorities = ["Low", "Medium", "High"];

        const taskPriorityLevels = taskPriorities.reduce(
            (acc, priority) => {
                acc[priority] =
                    taskPriorityLevelsRaw.find(
                        (item) => item._id === priority
                    )?.count || 0;

                return acc;
            },
            {}
        );

        return res.status(200).json({
            statistics: {
                totalTasks,
                pendingTasks,
                completedTasks,
                overdueTasks,
            },
            charts: {
                taskDistribution,
                taskPriorityLevels,
            },
            recentTasks,
        });
    } catch (error) {
        console.error("Admin dashboard error:", error);

        return res.status(500).json({
            message: "Unable to fetch admin dashboard data.",
        });
    }
};

// -------------------- MEMBER DASHBOARD --------------------

// @route GET /api/tasks/user-dashboard-data
// @access Private
const getUserDashboardData = async (req, res) => {
    try {
        const userId = req.user._id;
        const userFilter = { assignedTo: userId };

        const [
            totalTasks,
            pendingTasks,
            completedTasks,
            overdueTasks,
            taskDistributionRaw,
            taskPriorityLevelsRaw,
            recentTasks,
        ] = await Promise.all([
            Task.countDocuments(userFilter),
            Task.countDocuments({
                ...userFilter,
                status: "Pending",
            }),
            Task.countDocuments({
                ...userFilter,
                status: "Completed",
            }),
            Task.countDocuments({
                ...userFilter,
                status: { $ne: "Completed" },
                dueDate: { $lt: new Date() },
            }),
            Task.aggregate([
                { $match: { assignedTo: userId } },
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 },
                    },
                },
            ]),
            Task.aggregate([
                { $match: { assignedTo: userId } },
                {
                    $group: {
                        _id: "$priority",
                        count: { $sum: 1 },
                    },
                },
            ]),
            Task.find(userFilter)
                .sort({ createdAt: -1 })
                .limit(10)
                .select("title status priority dueDate createdAt"),
        ]);

        const taskStatuses = [
            "Pending",
            "In Progress",
            "Completed",
        ];

        const taskDistribution = taskStatuses.reduce(
            (acc, status) => {
                const key = status.replace(/\s+/g, "");

                acc[key] =
                    taskDistributionRaw.find(
                        (item) => item._id === status
                    )?.count || 0;

                return acc;
            },
            {}
        );

        taskDistribution.All = totalTasks;

        const taskPriorities = ["Low", "Medium", "High"];

        const taskPriorityLevels = taskPriorities.reduce(
            (acc, priority) => {
                acc[priority] =
                    taskPriorityLevelsRaw.find(
                        (item) => item._id === priority
                    )?.count || 0;

                return acc;
            },
            {}
        );

        return res.status(200).json({
            statistics: {
                totalTasks,
                pendingTasks,
                completedTasks,
                overdueTasks,
            },
            charts: {
                taskDistribution,
                taskPriorityLevels,
            },
            recentTasks,
        });
    } catch (error) {
        console.error("Member dashboard error:", error);

        return res.status(500).json({
            message: "Unable to fetch member dashboard data.",
        });
    }
};

// -------------------- UPLOAD TASK ATTACHMENTS --------------------

// @route POST /api/tasks/:id/attachments
// @access Admin only
const uploadTaskAttachments = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            removeUploadedFiles(req.files);

            return res.status(400).json({
                message: "Invalid task ID.",
            });
        }

        const task = await Task.findById(id);

        if (!task) {
            removeUploadedFiles(req.files);

            return res.status(404).json({
                message: "Task not found.",
            });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                message: "Please select at least one file.",
            });
        }

        // Maximum of five attachments per request and five MB per file
        // are also enforced in the Multer configuration.
        const uploadedFiles = req.files.map(
            (file) => `/uploads/${path.basename(file.filename)}`
        );

        task.attachments.push(...uploadedFiles);

        await task.save();

        const updatedTask = await Task.findById(id).populate(
            "assignedTo",
            "name email profileImageUrl"
        );

        return res.status(200).json({
            message: "Attachments uploaded successfully.",
            attachments: task.attachments,
            task: updatedTask,
        });
    } catch (error) {
        removeUploadedFiles(req.files);

        console.error("Attachment upload error:", error);

        return res.status(500).json({
            message: "Attachment upload failed.",
        });
    }
};

// -------------------- DOWNLOAD TASK ATTACHMENT --------------------

// @route GET /api/tasks/:id/attachments/:filename
// @access Admin or assigned member
const downloadTaskAttachment = async (req, res) => {
    try {
        const { id, filename } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                message: "Invalid task ID.",
            });
        }

        // Accept only a plain filename, never a path.
        if (
            !filename ||
            filename !== path.basename(filename) ||
            filename.includes("..")
        ) {
            return res.status(400).json({
                message: "Invalid attachment filename.",
            });
        }

        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found.",
            });
        }

        if (!canAccessTask(task, req.user)) {
            return res.status(403).json({
                message: "You are not authorized to access this attachment.",
            });
        }

        const attachmentExists = task.attachments.some(
            (attachment) =>
                path.basename(attachment) === filename
        );

        if (!attachmentExists) {
            return res.status(404).json({
                message: "Attachment not found.",
            });
        }

        const uploadDirectory = path.resolve(
            __dirname,
            "../uploads"
        );

        const filePath = path.resolve(
            uploadDirectory,
            filename
        );

        if (!filePath.startsWith(uploadDirectory + path.sep)) {
            return res.status(400).json({
                message: "Invalid file path.",
            });
        }

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                message: "File not found on server.",
            });
        }

        return res.download(filePath, filename, (error) => {
            if (error && !res.headersSent) {
                console.error("Attachment download error:", error);

                res.status(500).json({
                    message: "Unable to download attachment.",
                });
            }
        });
    } catch (error) {
        console.error("Download attachment error:", error);

        if (!res.headersSent) {
            return res.status(500).json({
                message: "Unable to download attachment.",
            });
        }
    }
};

// -------------------- EXPORT CONTROLLERS --------------------

module.exports = {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskChecklist,
    getDashboardData,
    getUserDashboardData,
    uploadTaskAttachments,
    downloadTaskAttachment,
};
