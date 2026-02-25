import { NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file");

        if (!file || file.size === 0) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Validate file size (max 50MB)
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: "File too large. Maximum 50MB allowed." },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const fileType = file.type || "";

        let resourceType = "auto";
        if (fileType.startsWith("image/")) resourceType = "image";
        else if (fileType.startsWith("video/")) resourceType = "video";

        const result = await uploadToCloudinary(buffer, {
            resource_type: resourceType,
        });

        return NextResponse.json(
            {
                url: result.secure_url,
                publicId: result.public_id,
                resourceType: result.resource_type,
                format: result.format,
                width: result.width,
                height: result.height,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Upload failed: " + error.message },
            { status: 500 }
        );
    }
}
