
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// -------------------- UPLOAD DIRECTORY --------------------

const uploadDirectory = path.resolve(__dirname, "../uploads");

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

// -------------------- STORAGE CONFIGURATION --------------------

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },

    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();

        const uniqueFilename =
            `${Date.now()}-${crypto.randomUUID()}${extension}`;

        cb(null, uniqueFilename);
    },
});

// -------------------- FILE VALIDATION --------------------

const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
];

const allowedExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
];

const fileFilter = (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    const validMimeType = allowedMimeTypes.includes(file.mimetype);
    const validExtension = allowedExtensions.includes(extension);

    if (validMimeType && validExtension) {
        return cb(null, true);
    }

    return cb(
        new Error("Only JPG, JPEG and PNG images are allowed.")
    );
};

// -------------------- MULTER CONFIGURATION --------------------

const upload = multer({
    storage,
    fileFilter,

    limits: {
        fileSize: 2 * 1024 * 1024, // Maximum 2 MB
        files: 1,
    },
});

module.exports = upload;
