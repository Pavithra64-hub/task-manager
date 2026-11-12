
const Task = require("../models/Task");
const User = require("../models/User");
const ExcelJS = require("exceljs");

// Export all tasks as an Excel file
const exportTasksReport = async (req, res) => {
    try {
        const tasks = await Task.find().populate(
            "assignedTo",
            "name email"
        );

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Tasks Report");

        worksheet.columns = [
            { header: "Task ID", key: "_id", width: 25 },
            { header: "Title", key: "title", width: 30 },
            { header: "Description", key: "description", width: 50 },
            { header: "Priority", key: "priority", width: 15 },
            { header: "Status", key: "status", width: 20 },
            { header: "Due Date", key: "dueDate", width: 20 },
            { header: "Assigned To", key: "assignedTo", width: 40 },
        ];

        tasks.forEach((task) => {
            const assignedUsers = Array.isArray(task.assignedTo)
                ? task.assignedTo
                : [];

            const assignedTo = assignedUsers
                .filter(Boolean)
                .map((user) => `${user.name} (${user.email})`)
                .join(", ");

            worksheet.addRow({
                _id: task._id.toString(),
                title: task.title,
                description: task.description || "",
                priority: task.priority,
                status: task.status,
                dueDate: task.dueDate
                    ? new Date(task.dueDate).toISOString().split("T")[0]
                    : "No due date",
                assignedTo: assignedTo || "Unassigned",
            });
        });

        worksheet.getRow(1).font = { bold: true };

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            'attachment; filename="tasks_report.xlsx"'
        );

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error("Task report error:", error);
        res.status(500).json({
            message: "Error exporting tasks",
            error: error.message,
        });
    }
};


// Export users and their task statistics as Excel
const exportUsersReport = async (req, res) => {
    try {
        const users = await User.find()
            .select("name email _id")
            .lean();

        const tasks = await Task.find().populate(
            "assignedTo",
            "name email _id"
        );

        const userTaskMap = {};

        users.forEach((user) => {
            userTaskMap[user._id.toString()] = {
                name: user.name,
                email: user.email,
                taskCount: 0,
                pendingTasks: 0,
                inProgressTasks: 0,
                completedTasks: 0,
            };
        });

        tasks.forEach((task) => {
            const assignedUsers = Array.isArray(task.assignedTo)
                ? task.assignedTo
                : [];

            assignedUsers.forEach((assignedUser) => {
                if (!assignedUser) return;

                const userId = assignedUser._id.toString();
                const user = userTaskMap[userId];

                if (!user) return;

                user.taskCount += 1;

                if (task.status === "Pending") {
                    user.pendingTasks += 1;
                } else if (task.status === "In Progress") {
                    user.inProgressTasks += 1;
                } else if (task.status === "Completed") {
                    user.completedTasks += 1;
                }
            });
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("User Task Report");

        worksheet.columns = [
            { header: "Name", key: "name", width: 30 },
            { header: "Email", key: "email", width: 40 },
            { header: "Total Assigned Tasks", key: "taskCount", width: 22 },
            { header: "Pending Tasks", key: "pendingTasks", width: 20 },
            { header: "In Progress Tasks", key: "inProgressTasks", width: 20 },
            { header: "Completed Tasks", key: "completedTasks", width: 20 },
        ];

        Object.values(userTaskMap).forEach((user) => {
            worksheet.addRow(user);
        });

        worksheet.getRow(1).font = { bold: true };

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            'attachment; filename="users_report.xlsx"'
        );

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error("User report error:", error);
        res.status(500).json({
            message: "Error exporting users",
            error: error.message,
        });
    }
};


module.exports = {
    exportTasksReport,
    exportUsersReport,
};
