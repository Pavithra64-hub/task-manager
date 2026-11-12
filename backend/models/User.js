
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        // User's full name
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must contain at least 2 characters"],
            maxlength: [100, "Name cannot exceed 100 characters"],
        },

        // Unique email address
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            maxlength: 254,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "Please provide a valid email address",
            ],
        },

        // Password is hashed in authController before saving
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: 8,
            select: false,
        },

        // User profile image
        profileImageUrl: {
            type: String,
            default: null,
            trim: true,
        },

        // Role-based access control
        role: {
            type: String,
            enum: {
                values: ["admin", "member"],
                message: "Role must be admin or member",
            },
            default: "member",
            required: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Export User model
module.exports = mongoose.model("User", UserSchema);
