
const express = require("express");
const router = express.Router();

const { protect, adminOnly } = require("../middlewares/authMiddleware");
const upload = require("../config/multer");

const {
    getDashboardData,
    getUserDashboardData,
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskChecklist,
    uploadTaskAttachments,
    downloadTaskAttachment,
} = require("../controllers/taskController");

// Dashboard routes
router.get("/dashboard-data", protect, getDashboardData);
router.get("/user-dashboard-data", protect, getUserDashboardData);

// Task management routes
router.get("/", protect, getTasks);

// Attachment download route
router.get(
    "/:id/attachments/:filename",
    protect,
    downloadTaskAttachment
);

router.get("/:id", protect, getTaskById);
router.post("/", protect, adminOnly, createTask);
router.put("/:id", protect, adminOnly, updateTask);
router.delete("/:id", protect, adminOnly, deleteTask);

// Status and checklist routes
router.put("/:id/status", protect, updateTaskStatus);
router.put("/:id/todo", protect, updateTaskChecklist);

// Attachment upload route (Admin only)
router.post(
    "/:id/attachments",
    protect,
    adminOnly,
    upload.array("attachments", 5),
    uploadTaskAttachments
);

module.exports = router;
