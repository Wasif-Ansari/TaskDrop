import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(fileBuffer, options = {}) {
    return new Promise((resolve, reject) => {
        const uploadOptions = {
            folder: "clipper-todo",
            resource_type: "auto",
            ...options,
        };

        const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );

        uploadStream.end(fileBuffer);
    });
}

export default cloudinary;
