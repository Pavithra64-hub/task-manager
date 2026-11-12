
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// -------------------- PROTECT MIDDLEWARE --------------------

const protect = async (req, res, next) => {
    try {
        // Check JWT secret configuration
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not configured.");

            return res.status(500).json({
                message: "Server authentication configuration error.",
            });
        }

        // Read Authorization header
        const authHeader = req.headers.authorization;

        // Validate Bearer token format
        if (!authHeader || !/^Bearer\s+\S+$/i.test(authHeader)) {
            return res.status(401).json({
                message: "Not authorized. Please provide a valid token.",
            });
        }

        // Extract token
        const token = authHeader.split(/\s+/)[1];

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET,
            { algorithms: ["HS256"] }
        );

        // Validate decoded payload
        if (!decoded || !decoded.id) {
            return res.status(401).json({
                message: "Invalid authentication token.",
            });
        }

        // Find user in database
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({
                message: "User account not found. Please log in again.",
            });
        }

        // Attach authenticated user
        req.user = user;

        return next();

    } catch (error) {
        console.error("Authentication error:", error.message);

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Session expired. Please log in again.",
            });
        }

        if (
            error.name === "JsonWebTokenError" ||
            error.name === "NotBeforeError"
        ) {
            return res.status(401).json({
                message: "Invalid authentication token.",
            });
        }

        return res.status(500).json({
            message: "Authentication failed due to a server error.",
        });
    }
};

// -------------------- ADMIN ONLY MIDDLEWARE --------------------

const adminOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Not authorized. Please log in first.",
        });
    }

    if (req.user.role !== "admin") {
        return res.status(403).json({
            message: "Access denied. Administrator privileges required.",
        });
    }

    return next();
};

// -------------------- EXPORT --------------------

module.exports = {
    protect,
    adminOnly,
};
