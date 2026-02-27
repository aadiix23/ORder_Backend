const cloudinary = require("../config/cloudinary");

exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No image file provided" });
        }

        // Upload buffer to Cloudinary using a stream
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: "qrder-menu",
                    resource_type: "image",
                    transformation: [
                        { width: 800, height: 800, crop: "limit", quality: "auto" },
                    ],
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(req.file.buffer);
        });

        res.status(200).json({
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
        });
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        res.status(500).json({ success: false, message: error.message || "Image upload failed" });
    }
};
