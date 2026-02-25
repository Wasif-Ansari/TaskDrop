"use client";

import { useState } from "react";
import useTaskStore from "@/lib/store";

export default function TaskCard({ task, onClick }) {
    const { toggleTask, deleteTask } = useTaskStore();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isToggling, setIsToggling] = useState(false);

    const handleToggle = async (e) => {
        e.stopPropagation();
        setIsToggling(true);
        await toggleTask(task._id);
        setIsToggling(false);
    };

    const handleDelete = async (e) => {
        e.stopPropagation();
        setIsDeleting(true);
        await deleteTask(task._id);
    };

    // Refined Color Palette
    const typeConfig = {
        link: {
            icon: (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.07a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.343 8.07" />
                </svg>
            ),
            bg: "bg-blue-500/10",
            text: "text-blue-400",
            accent: "bg-blue-500",
        },
        image: {
            icon: (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                </svg>
            ),
            bg: "bg-emerald-500/10",
            text: "text-emerald-400",
            accent: "bg-emerald-500",
        },
        video: {
            icon: (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                </svg>
            ),
            bg: "bg-rose-500/10",
            text: "text-rose-400",
            accent: "bg-rose-500",
        },
        text: {
            icon: (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
            ),
            bg: "bg-gray-800",
            text: "text-gray-300",
            accent: "bg-gray-400",
        },
    };

    const config = typeConfig[task.type] || typeConfig.text;

    const thumbnailUrl =
        task.mediaUrl ||
        task.linkPreview?.image ||
        "";

    // Relative Time formatting
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}h`;
        if (diffDays < 7) return `${diffDays}d`;
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    return (
        <div
            onClick={onClick}
            className={`group relative glass-card rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 mb-3 ${task.isCompleted ? "opacity-50 grayscale pt-0 pb-0 scale-[0.99] border-transparent" : "hover:-translate-y-0.5 hover:shadow-xl"
                }`}
        >
            {/* Type indicator bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.accent} opacity-70 group-hover:opacity-100 transition-opacity`} />

            <div className="p-4 sm:p-5 flex items-center gap-4">

                {/* Checkbox / Toggle */}
                <button
                    onClick={handleToggle}
                    disabled={isToggling}
                    className={`flex-shrink-0 w-5 h-5 rounded-[4px] border flex items-center justify-center transition-all ${task.isCompleted
                            ? "bg-white border-white text-black"
                            : "border-white/20 hover:border-white/50 text-transparent"
                        } ${isToggling ? "opacity-50" : ""}`}
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </button>

                {/* Thumbnail View */}
                {thumbnailUrl && (
                    <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 relative">
                            <img
                                src={thumbnailUrl}
                                alt=""
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                            {task.type === "video" && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center pl-0.5">
                                        <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex-1 min-w-0 py-1">
                    <div className="flex items-center gap-2 mb-1.5">
                        <h3
                            className={`text-[15px] font-medium tracking-tight truncate ${task.isCompleted ? "text-gray-400 line-through" : "text-gray-100"
                                }`}
                        >
                            {task.title}
                        </h3>
                    </div>

                    {task.description && (
                        <p className="text-[13px] text-gray-500 line-clamp-1 mt-0.5">
                            {task.description}
                        </p>
                    )}

                    {/* Metadata Footer */}
                    <div className="flex items-center gap-3 mt-2.5">
                        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium ${config.bg} ${config.text}`}>
                            {config.icon}
                            <span className="uppercase tracking-wider">{task.type}</span>
                        </div>
                        {task.linkPreview?.siteName && (
                            <span className="text-[11px] text-gray-500 font-medium">
                                {task.linkPreview.siteName}
                            </span>
                        )}
                        <span className="text-[11px] text-gray-600 font-medium whitespace-nowrap ml-auto">
                            {formatDate(task.createdAt)}
                        </span>
                    </div>
                </div>

                {/* Hover Actions */}
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                        {isDeleting ? (
                            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <svg className="w-4 h-4 text-gray-400 hover:text-red-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
