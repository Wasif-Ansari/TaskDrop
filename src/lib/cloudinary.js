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
            resource_type: "raw",
            ...options,
        };

        // Cloudinary upload_stream can be limited around 10MB on some plans.
        // Switch to chunked uploads for larger payloads.
        const useChunkedUpload = fileBuffer.length > 10 * 1024 * 1024;
        const uploadStream = useChunkedUpload
            ? cloudinary.uploader.upload_chunked_stream(
                {
                    ...uploadOptions,
                    chunk_size: 6 * 1024 * 1024,
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            )
            : cloudinary.uploader.upload_stream(
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
