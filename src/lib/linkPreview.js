import { getLinkPreview } from "link-preview-js";

export async function fetchLinkPreview(url) {
    try {
        const data = await getLinkPreview(url, {
            timeout: 5000,
            headers: {
                "user-agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
            followRedirects: "follow",
        });

        return {
            title: data.title || "",
            description: data.description || "",
            image: data.images?.[0] || data.favicons?.[0] || "",
            siteName: data.siteName || "",
            url: data.url || url,
        };
    } catch (error) {
        console.error("Link preview fetch failed:", error.message);
        return {
            title: "",
            description: "",
            image: "",
            siteName: "",
            url: url,
        };
    }
}
