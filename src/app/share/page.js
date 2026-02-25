"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ShareContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const title = searchParams.get("title") || "";
        const text = searchParams.get("text") || "";
        const url = searchParams.get("url") || "";

        // Create task from shared data
        const createTask = async () => {
            try {
                await fetch("/api/share", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ title, text, url }),
                });
            } catch (err) {
                console.error("Share failed:", err);
            }
            router.push("/");
        };

        if (title || text || url) {
            createTask();
        } else {
            router.push("/");
        }
    }, [router, searchParams]);

    return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-xl shadow-violet-500/25 animate-pulse">
                    <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
                        />
                    </svg>
                </div>
                <p className="text-gray-400 text-sm">Processing shared content...</p>
                <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
        </div>
    );
}

export default function SharePage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-[80vh] flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                </div>
            }
        >
            <ShareContent />
        </Suspense>
    );
}
