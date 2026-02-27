const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const { uploadImage } = require("../controller/uploadController");
const { auth, onlyAdmin } = require("../middlewares/auth");

// POST /upload — upload an image (admin only)
router.post("/", auth, onlyAdmin, upload.single("image"), uploadImage);

module.exports = router;
