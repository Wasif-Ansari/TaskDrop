import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Task from "@/models/Task";
import { fetchLinkPreview } from "@/lib/linkPreview";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { invalidateTaskListCache } from "@/lib/taskCache";

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
    const parts = String(fileName).toLowerCase().split(".");
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

// POST /api/share - Handle Web Share Target
export async function POST(request) {
    try {
        await dbConnect();

        const contentType = request.headers.get("content-type") || "";

        let title = "";
        let description = "";
        let url = "";
        let mediaUrl = "";
        let type = "text";
        let files = [];

        if (contentType.includes("multipart/form-data")) {
            const formData = await request.formData();
            title = formData.get("title") || "";
            description = formData.get("text") || formData.get("description") || "";
            url = formData.get("url") || "";

            // Handle one or many shared files from mobile share target.
            const sharedFiles = [
                ...formData.getAll("file"),
                ...formData.getAll("media"),
            ].filter((item) => item && typeof item === "object" && Number(item.size) > 0);

            for (const file of sharedFiles) {
                const buffer = Buffer.from(await file.arrayBuffer());
                const fileType = file.type || "";
                const fileName = file.name || "file";
                const resourceType = getResourceType(fileType, fileName);

                try {
                    const result = await uploadToCloudinary(buffer, {
                        resource_type: resourceType,
                    });

                    files.push({
                        name: fileName,
                        url: result.secure_url,
                        publicId: result.public_id,
                        size: file.size || 0,
                        type: fileType,
                        resourceType: result.resource_type || resourceType,
                    });

                    if (!mediaUrl && (resourceType === "image" || resourceType === "video")) {
                        mediaUrl = result.secure_url;
                    }
                } catch (uploadError) {
                    console.error("Cloudinary upload failed:", uploadError);
                }
            }

            if (files.length > 0) {
                const hasVideo = files.some((f) => f.resourceType === "video");
                const hasImage = files.some((f) => f.resourceType === "image");

                if (hasVideo) {
                    type = "video";
                } else if (hasImage) {
                    type = "image";
                } else {
                    type = "file";
                }

                if (!title) {
                    title = files.length === 1
                        ? files[0].name
                        : `${files[0].name} +${files.length - 1} file(s)`;
                }
            }
        } else {
            const body = await request.json();
            title = body.title || "";
            description = body.text || body.description || "";
            url = body.url || "";
        }

        // Detect URL in text/description if not provided
        if (!url && description) {
            const urlMatch = description.match(
                /https?:\/\/[^\s]+/
            );
            if (urlMatch) {
                url = urlMatch[0];
            }
        }

        // Determine type
        if (url && type === "text") {
            type = "link";
        }

        // Fetch link preview for URLs
        let linkPreview = {};
        if (type === "link" && url) {
            linkPreview = await fetchLinkPreview(url);
            if (!title && linkPreview.title) {
                title = linkPreview.title;
            }
            if (!description && linkPreview.description) {
                description = linkPreview.description;
            }
            if (!mediaUrl && linkPreview.image) {
                mediaUrl = linkPreview.image;
            }
        }

        // Fallback title
        if (!title) {
            title = url || description?.substring(0, 100) || "Shared Item";
        }

        const task = await Task.create({
            title,
            description,
            url,
            mediaUrl,
            type,
            linkPreview,
            files,
        });

        await invalidateTaskListCache();

        // If this came from a mobile share sheet (which uses formData), return a UI that auto-closes
        if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
            const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0">
                <title>Saved</title>
                <style>
                    body {
                        background-color: #000;
                        color: #fff;
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        height: 100vh;
                        margin: 0;
                        text-align: center;
                    }
                    .icon {
                        width: 64px;
                        height: 64px;
                        background: rgba(59, 130, 246, 0.1);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-bottom: 20px;
                        color: #3b82f6;
                    }
                    h1 {
                        font-size: 24px;
                        font-weight: 600;
                        margin: 0 0 8px;
                    }
                    p {
                        color: #9ca3af;
                        margin: 0;
                        font-size: 15px;
                    }
                </style>
            </head>
            <body>
                <div class="icon">
                    <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1>Saved to Clipper</h1>
                <p>You can close this window.</p>
                <script>
                    setTimeout(() => {
                        window.close();
                    }, 500);
                </script>
            </body>
            </html>
            `;
            return new NextResponse(html, {
                status: 200,
                headers: { "Content-Type": "text/html" },
            });
        }

        // For programmatic share POSTs from the web app, return JSON
        return NextResponse.json({ task }, { status: 201 });
    } catch (error) {
        console.error("POST /api/share error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
