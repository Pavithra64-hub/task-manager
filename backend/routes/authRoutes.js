
const express = require("express");

const {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
} = require("../controllers/authController");

const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

// -------------------- PUBLIC AUTH ROUTES --------------------

// Register a new account
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// -------------------- PROTECTED PROFILE ROUTES --------------------

// Get logged-in user's profile
router.get("/profile", protect, getUserProfile);

// Update logged-in user's profile
router.put("/profile", protect, updateUserProfile);

// -------------------- PROTECTED IMAGE UPLOAD --------------------

// Only authenticated users can upload profile images.
router.post(
    "/upload-image",
    protect,
    upload.single("image"),
    (req, res) => {
        if (!req.file) {
            return res.status(400).json({
                message: "Please select an image to upload.",
            });
        }

        const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

        return res.status(200).json({
            message: "Profile image uploaded successfully.",
            imageUrl,
        });
    }
);

module.exports = router;
