import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Task from "@/models/Task";
import { fetchLinkPreview } from "@/lib/linkPreview";
import { uploadToCloudinary } from "@/lib/cloudinary";

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

        if (contentType.includes("multipart/form-data")) {
            const formData = await request.formData();
            title = formData.get("title") || "";
            description = formData.get("text") || formData.get("description") || "";
            url = formData.get("url") || "";

            // Handle file uploads
            const file = formData.get("file") || formData.get("media");
            if (file && file.size > 0) {
                const buffer = Buffer.from(await file.arrayBuffer());
                const fileType = file.type || "";

                let resourceType = "auto";
                if (fileType.startsWith("image/")) {
                    type = "image";
                    resourceType = "image";
                } else if (fileType.startsWith("video/")) {
                    type = "video";
                    resourceType = "video";
                }

                try {
                    const result = await uploadToCloudinary(buffer, {
                        resource_type: resourceType,
                    });
                    mediaUrl = result.secure_url;
                } catch (uploadError) {
                    console.error("Cloudinary upload failed:", uploadError);
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
        });

        // For share target, redirect to dashboard
        return NextResponse.json({ task, redirect: "/" }, { status: 201 });
    } catch (error) {
        console.error("POST /api/share error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
