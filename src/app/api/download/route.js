import { NextResponse } from "next/server";

function sanitizeFileName(fileName = "download") {
    return String(fileName)
        .replace(/[\\/:*?"<>|\r\n]+/g, "_")
        .trim() || "download";
}

function isAllowedRemoteUrl(url) {
    try {
        const parsed = new URL(url);
        if (parsed.protocol !== "https:") {
            return false;
        }

        // Restrict to Cloudinary-hosted assets to avoid turning this into an open proxy.
        return parsed.hostname.endsWith("res.cloudinary.com");
    } catch {
        return false;
    }
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const sourceUrl = searchParams.get("url") || "";
        const requestedName = searchParams.get("name") || "download";

        if (!sourceUrl || !isAllowedRemoteUrl(sourceUrl)) {
            return NextResponse.json(
                { error: "Invalid download URL" },
                { status: 400 }
            );
        }

        const upstream = await fetch(sourceUrl, { cache: "no-store" });

        if (!upstream.ok || !upstream.body) {
            return NextResponse.json(
                { error: "Failed to fetch file" },
                { status: 502 }
            );
        }

        const safeName = sanitizeFileName(requestedName);
        const contentType =
            upstream.headers.get("content-type") || "application/octet-stream";

        return new NextResponse(upstream.body, {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": `attachment; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(safeName)}`,
                "Cache-Control": "private, no-store",
            },
        });
    } catch (error) {
        console.error("GET /api/download error:", error);
        return NextResponse.json(
            { error: "Download failed" },
            { status: 500 }
        );
    }
}
