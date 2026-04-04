import { NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";

const IMAGE_EXTENSIONS = new Set([
    "jpg",
    "jpeg",
    "png",
    "gif",
    "webp",
    "avif",
    "bmp",
    "svg",
    "heic",
    "heif",
]);

const VIDEO_EXTENSIONS = new Set([
    "mp4",
    "mov",
    "m4v",
    "webm",
    "avi",
    "mkv",
    "mpeg",
    "mpg",
    "3gp",
]);

function getExtension(fileName = "") {
    const parts = fileName.toLowerCase().split(".");
    return parts.length > 1 ? parts.pop() : "";
}

function getResourceType(fileType = "", fileName = "") {
    if (fileType.startsWith("image/")) {
        return "image";
    }

    if (fileType.startsWith("video/")) {
        return "video";
    }

    const ext = getExtension(fileName);

    if (IMAGE_EXTENSIONS.has(ext)) {
        return "image";
    }

    if (VIDEO_EXTENSIONS.has(ext)) {
        return "video";
    }

    return "raw";
}

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file");

        if (!file || file.size === 0) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Validate file size (max 100MB)
        const maxSize = 100 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: "File too large. Maximum 100MB allowed." },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const fileType = file.type || "";
        const fileName = file.name || "file";

        // Explicitly choose Cloudinary resource type to avoid misclassification.
        const resourceType = getResourceType(fileType, fileName);

        const result = await uploadToCloudinary(buffer, {
            resource_type: resourceType,
        });

        // Return comprehensive file metadata
        return NextResponse.json(
            {
                name: fileName,
                url: result.secure_url,
                publicId: result.public_id,
                resourceType: result.resource_type,
                format: result.format,
                size: file.size,
                type: fileType,
                // Image/video specific fields (if applicable)
                ...(result.width && { width: result.width }),
                ...(result.height && { height: result.height }),
                ...(result.duration && { duration: result.duration }),
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Upload error:", error);

        const providerStatus = Number(error?.http_code);
        const status = Number.isInteger(providerStatus)
            ? providerStatus
            : 500;

        const isProvider10MbLimit =
            typeof error?.message === "string" &&
            (error.message.includes("Maximum is 10485760") ||
                error.message.includes("Max: 10485760"));

        const friendlyMessage = isProvider10MbLimit
            ? "Upload failed: Cloudinary rejected this file at a 10MB provider limit for the detected resource type. If this is a video, ensure it keeps a video extension (for example .mp4 or .mov)."
            : "Upload failed: " + error.message;

        return NextResponse.json(
            { error: friendlyMessage },
            { status }
        );
    }
}
