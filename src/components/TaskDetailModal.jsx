"use client";

import useTaskStore from "@/lib/store";
import { useEffect, useState } from "react";

export default function TaskDetailModal({ task, isOpen, onClose }) {
    const { toggleTask, deleteTask } = useTaskStore();
    const [isDeleting, setIsDeleting] = useState(false);

    // Close on ESC
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && isOpen) onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen || !task) return null;

    const handleToggle = async () => {
        await toggleTask(task._id);
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        await deleteTask(task._id);
        setIsDeleting(false);
        onClose();
    };

    // Refined Color Palette
    const typeConfig = {
        link: { label: "Link", color: "text-blue-400", border: "border-blue-500/20", icon: "🔗" },
        image: { label: "Image", color: "text-emerald-400", border: "border-emerald-500/20", icon: "🖼️" },
        video: { label: "Video", color: "text-rose-400", border: "border-rose-500/20", icon: "🎬" },
        text: { label: "Note", color: "text-gray-300", border: "border-gray-500/20", icon: "📝" },
    };

    const config = typeConfig[task.type] || typeConfig.text;
    const thumbnailUrl = task.mediaUrl || task.linkPreview?.image || "";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-2xl transition-all duration-500"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden fade-in-up max-h-[90vh] flex flex-col">

                {/* Header Actions Overlay */}
                <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-gray-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 sm:opacity-100"
                        title="Delete Task"
                    >
                        {isDeleting ? (
                            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        )}
                    </button>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
                        title="Close (Esc)"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Media Preview Header */}
                {thumbnailUrl && (
                    <div className="w-full relative bg-black flex-shrink-0 group">
                        {task.type === "video" && task.mediaUrl ? (
                            <video
                                src={task.mediaUrl}
                                controls
                                className="w-full h-[40vh] object-contain"
                            />
                        ) : (
                            <div className="relative h-[30vh] sm:h-[40vh] w-full">
                                {/* Blur background */}
                                <div
                                    className="absolute inset-0 bg-cover bg-center blur-3xl opacity-30"
                                    style={{ backgroundImage: `url(${thumbnailUrl})` }}
                                />
                                <img
                                    src={thumbnailUrl}
                                    alt={task.title}
                                    className="relative w-full h-full object-contain z-10"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Scrollable Content Area */}
                <div className="p-6 sm:p-10 overflow-y-auto custom-scrollbar flex-1 pb-24">
                    <div className="flex items-center gap-3 mb-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.border} ${config.color} bg-white/[0.02]`}>
                            <span className="opacity-80">{config.icon}</span>
                            {config.label}
                        </span>
                        <span className="text-xs font-medium text-gray-600 tracking-wide uppercase">
                            {new Date(task.createdAt).toLocaleDateString("en-US", {
                                month: "short", day: "numeric", hour: "numeric", minute: "2-digit"
                            })}
                        </span>
                    </div>

                    <h2 className={`text-2xl sm:text-3xl font-semibold tracking-tight leading-snug mb-6 ${task.isCompleted ? "text-gray-500 line-through" : "text-white"}`}>
                        {task.title}
                    </h2>

                    {task.url && (
                        <div className="mb-6 flex">
                            <a
                                href={task.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center gap-3 px-4 py-3 bg-white/[0.03] border border-white/5 hover:border-blue-500/30 rounded-2xl w-full transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex flex-shrink-0 items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.07a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.343 8.07" />
                                    </svg>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-blue-400 truncate group-hover:text-blue-300">
                                        {task.url}
                                    </p>
                                    {task.linkPreview?.siteName && (
                                        <p className="text-xs text-gray-500 mt-0.5">{task.linkPreview.siteName}</p>
                                    )}
                                </div>
                                <svg className="w-4 h-4 text-gray-500 ml-auto group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        </div>
                    )}

                    {task.description && (
                        <div className="prose prose-invert prose-p:text-gray-400 prose-p:leading-relaxed max-w-none">
                            <p className="whitespace-pre-wrap text-[15px]">{task.description}</p>
                        </div>
                    )}
                </div>

                {/* Bottom Actions Bar */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent pointer-events-none flex justify-center">
                    <button
                        onClick={handleToggle}
                        className={`pointer-events-auto px-8 py-3.5 rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-3 shadow-2xl ${task.isCompleted
                                ? "bg-white/[0.05] text-white hover:bg-white/10 hover:scale-[1.02] border border-white/10"
                                : "bg-white text-black hover:scale-[1.02] active:scale-[0.98]"
                            }`}
                    >
                        {task.isCompleted ? (
                            <>
                                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                </svg>
                                Reopen Task
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                Mark as Complete
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
}
