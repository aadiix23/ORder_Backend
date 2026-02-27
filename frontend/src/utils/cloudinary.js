const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Upload a file to Cloudinary using unsigned upload preset.
 * @param {File} file - The image file to upload
 * @param {function} onProgress - Optional progress callback (0-100)
 * @returns {Promise<{url: string, publicId: string}>}
 */
export const uploadToCloudinary = (file, onProgress) => {
    return new Promise((resolve, reject) => {
        if (!CLOUD_NAME || CLOUD_NAME === 'your_cloud_name_here') {
            reject(new Error('Cloudinary not configured. Set VITE_CLOUDINARY_CLOUD_NAME in .env'));
            return;
        }
        if (!UPLOAD_PRESET || UPLOAD_PRESET === 'your_unsigned_preset_here') {
            reject(new Error('Cloudinary not configured. Set VITE_CLOUDINARY_UPLOAD_PRESET in .env'));
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);
        formData.append('folder', 'qrder-menu');

        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable && onProgress) {
                onProgress(Math.round((e.loaded / e.total) * 100));
            }
        };

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                const data = JSON.parse(xhr.responseText);
                resolve({
                    url: data.secure_url,
                    publicId: data.public_id,
                });
            } else {
                try {
                    const err = JSON.parse(xhr.responseText);
                    reject(new Error(err?.error?.message || 'Upload failed'));
                } catch {
                    reject(new Error('Upload failed'));
                }
            }
        };

        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(formData);
    });
};
