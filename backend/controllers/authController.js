
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// -------------------- CONFIGURATION --------------------

const PASSWORD_MIN_LENGTH = 8;

// -------------------- HELPER FUNCTIONS --------------------

// Generate JWT token.
const generateToken = (userId) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured.");
    }

    return jwt.sign(
        { id: userId.toString() },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d",
            algorithm: "HS256",
        }
    );
};

// Validate email format.
const isValidEmail = (email) => {
    return (
        typeof email === "string" &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    );
};

// Validate password strength.
const isValidPassword = (password) => {
    return (
        typeof password === "string" &&
        password.length >= PASSWORD_MIN_LENGTH &&
        password.length <= 128
    );
};

// Compare admin invitation tokens safely.
const isValidAdminInvite = (providedToken) => {
    const actualToken = process.env.ADMIN_INVITE_TOKEN;

    if (
        typeof providedToken !== "string" ||
        !actualToken ||
        providedToken.length !== actualToken.length
    ) {
        return false;
    }

    return crypto.timingSafeEqual(
        Buffer.from(providedToken),
        Buffer.from(actualToken)
    );
};

// -------------------- REGISTER USER --------------------

// @desc Register a new user
// @route POST /api/auth/register
// @access Public

const registerUser = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            adminInviteToken,
        } = req.body;

        // Validate name.
        if (
            typeof name !== "string" ||
            !name.trim() ||
            name.trim().length > 100
        ) {
            return res.status(400).json({
                message: "Please provide a valid name (maximum 100 characters).",
            });
        }

        // Validate email.
        if (!isValidEmail(email)) {
            return res.status(400).json({
                message: "Please provide a valid email address.",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Validate password.
        if (!isValidPassword(password)) {
            return res.status(400).json({
                message: "Password must be between 8 and 128 characters.",
            });
        }

        // Check JWT configuration.
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                message: "Server authentication configuration error.",
            });
        }

        // Check whether user already exists.
        const userExists = await User.findOne({
            email: normalizedEmail,
        });

        if (userExists) {
            return res.status(409).json({
                message: "An account with this email already exists.",
            });
        }

        // Default role is member.
        // Only a valid invitation token can create an admin.
        const role = isValidAdminInvite(adminInviteToken)
            ? "admin"
            : "member";

        // Hash password.
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user.
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role,
        });

        // Generate token.
        const token = generateToken(user._id);

        return res.status(201).json({
            message: "Registration successful.",
            _id: user._id,
            name: user.name,
            email: user.email,
            profileImageUrl: user.profileImageUrl,
            role: user.role,
            token,
        });

    } catch (error) {
        console.error("Registration error:", error);

        // Handle duplicate email race conditions.
        if (error.code === 11000) {
            return res.status(409).json({
                message: "An account with this email already exists.",
            });
        }

        return res.status(500).json({
            message: "Unable to register user.",
        });
    }
};

// -------------------- LOGIN USER --------------------

// @desc Login user
// @route POST /api/auth/login
// @access Public

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            !isValidEmail(email) ||
            typeof password !== "string" ||
            !password
        ) {
            return res.status(400).json({
                message: "Please provide a valid email and password.",
            });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                message: "Server authentication configuration error.",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Find user.
        const user = await User.findOne({
            email: normalizedEmail,
        });

        // Use the same response for unknown email and wrong password.
        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password.",
            });
        }

        // Compare password.
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password.",
            });
        }

        // Generate JWT.
        const token = generateToken(user._id);

        return res.status(200).json({
            message: "Login successful.",
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profileImageUrl: user.profileImageUrl,
            token,
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Unable to log in.",
        });
    }
};

// -------------------- GET USER PROFILE --------------------

// @desc Get authenticated user profile
// @route GET /api/auth/profile
// @access Private

const getUserProfile = async (req, res) => {
    try {
        // protect middleware already fetches the authenticated user.
        const user = await User.findById(req.user._id).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found.",
            });
        }

        return res.status(200).json(user);

    } catch (error) {
        console.error("Get profile error:", error);

        return res.status(500).json({
            message: "Unable to fetch profile.",
        });
    }
};

// -------------------- UPDATE USER PROFILE --------------------

// @desc Update authenticated user profile
// @route PUT /api/auth/profile
// @access Private

const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                message: "User not found.",
            });
        }

        const { name, email, password } = req.body;

        // Update name.
        if (name !== undefined) {
            if (
                typeof name !== "string" ||
                !name.trim() ||
                name.trim().length > 100
            ) {
                return res.status(400).json({
                    message: "Please provide a valid name.",
                });
            }

            user.name = name.trim();
        }

        // Update email.
        if (email !== undefined) {
            if (!isValidEmail(email)) {
                return res.status(400).json({
                    message: "Please provide a valid email address.",
                });
            }

            const normalizedEmail = email.trim().toLowerCase();

            // Check whether another account uses this email.
            const existingUser = await User.findOne({
                email: normalizedEmail,
                _id: { $ne: user._id },
            });

            if (existingUser) {
                return res.status(409).json({
                    message: "This email address is already in use.",
                });
            }

            user.email = normalizedEmail;
        }

        // Update password only when supplied.
        if (password !== undefined && password !== "") {
            if (!isValidPassword(password)) {
                return res.status(400).json({
                    message: "Password must be between 8 and 128 characters.",
                });
            }

            user.password = await bcrypt.hash(password, 12);
        }

        // Never accept role changes or arbitrary profile fields here.
        const updatedUser = await user.save();

        // Generate a new token.
        const token = generateToken(updatedUser._id);

        return res.status(200).json({
            message: "Profile updated successfully.",
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            profileImageUrl: updatedUser.profileImageUrl,
            role: updatedUser.role,
            token,
        });

    } catch (error) {
        console.error("Update profile error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                message: "This email address is already in use.",
            });
        }

        return res.status(500).json({
            message: "Unable to update profile.",
        });
    }
};

// -------------------- EXPORT CONTROLLERS --------------------

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
};
