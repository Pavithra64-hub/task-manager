
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();

// -------------------- SECURITY CONFIGURATION --------------------

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.disable("x-powered-by");

// -------------------- CORS CONFIGURATION --------------------

app.use(
    cors({
        origin: CLIENT_URL,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// -------------------- BODY PARSING --------------------

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// -------------------- PUBLIC PROFILE IMAGES ONLY --------------------

// IMPORTANT:
// Do not expose the complete uploads directory.
// Task attachments must remain private.

const profileImagesDirectory = path.resolve(
    __dirname,
    "uploads/profile-images"
);

app.use(
    "/uploads/profile-images",
    express.static(profileImagesDirectory, {
        index: false,
        dotfiles: "deny",
        fallthrough: false,
    })
);

// -------------------- API ROUTES --------------------

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/reports", reportRoutes);

// -------------------- NOT FOUND HANDLER --------------------

app.use((req, res) => {
    return res.status(404).json({
        message: "Requested API endpoint not found.",
    });
});

// -------------------- GLOBAL ERROR HANDLER --------------------

app.use((error, req, res, next) => {
    console.error("Server error:", error.message);

    if (res.headersSent) {
        return next(error);
    }

    if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
            message: "File exceeds the allowed upload size.",
        });
    }

    if (error.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({
            message: "Too many files uploaded.",
        });
    }

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({
            message: "Unexpected file field.",
        });
    }

    if (error.name === "MulterError") {
        return res.status(400).json({
            message: "File upload failed.",
        });
    }

    if (error.message?.includes("Only JPG")) {
        return res.status(400).json({
            message: error.message,
        });
    }

    return res.status(500).json({
        message: "Internal server error.",
    });
});

// -------------------- START SERVER --------------------

const PORT = process.env.PORT || 8000;

const startServer = async () => {
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is missing from environment variables.");
        }

        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
};

startServer();

module.exports = app;
