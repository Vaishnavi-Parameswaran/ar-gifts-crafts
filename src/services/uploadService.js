// Cloudinary Configuration
const CLOUDINARY_CLOUD_NAME = "dbkk5wv2d";
const CLOUDINARY_UPLOAD_PRESET = "Vaishnavi";
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

/**
 * Uploads a file to Cloudinary with performance optimization.
 * @param {File} file - The file object to upload.
 * @param {string} dataPath - Specific folder path in Cloudinary (e.g., 'profiles', 'products').
 * @param {function} onProgress - Callback function for upload progress (0-100).
 * @returns {Promise<string>} - The secure download URL of the uploaded file.
 */
export const uploadFile = (file, dataPath = 'uploads', onProgress) => {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject(new Error('No file selected'));
            return;
        }

        const xhr = new XMLHttpRequest();
        const formData = new FormData();

        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('folder', `ar-one/${dataPath}`); // Organizes files in Cloudinary

        // Track progress if a callback is provided
        if (onProgress && xhr.upload) {
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percentComplete = Math.round((e.loaded / e.total) * 100);
                    onProgress(percentComplete);
                }
            });
        }

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    const response = JSON.parse(xhr.responseText);
                    resolve(response.secure_url); // Returns the HTTPS URL
                } else {
                    console.error("Cloudinary Upload Error:", xhr.responseText);
                    reject(new Error('Failed to upload image to Cloudinary.'));
                }
            }
        };

        xhr.onerror = () => {
            reject(new Error('Network error during upload.'));
        };

        xhr.open('POST', CLOUDINARY_URL, true);
        xhr.send(formData);
    });
};
