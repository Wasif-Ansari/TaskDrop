"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import useTaskStore from "@/lib/store";

export default function CreateTaskModal({ isOpen, onClose }) {
    const { addTask } = useTaskStore();
    const [type, setType] = useState("text");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [url, setUrl] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [mediaUrl, setMediaUrl] = useState("");
    const [error, setError] = useState("");
    const fileInputRef = useRef(null);

    // Close on ESC
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && isOpen) resetAndClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen]);

    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!isOpen || !mounted) return null;

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Upload failed");
            }

            const data = await res.json();
            setMediaUrl(data.url);

            if (file.type.startsWith("image/")) {
                setType("image");
            } else if (file.type.startsWith("video/")) {
                setType("video");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) {
            setError("Title is required");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            await addTask({
                title: title.trim(),
                description: description.trim(),
                url: url.trim(),
                mediaUrl,
                type,
            });
            resetAndClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetAndClose = () => {
        setType("text");
        setTitle("");
        setDescription("");
        setUrl("");
        setMediaUrl("");
        setError("");
        onClose();
    };

    const types = [
        { key: "text", label: "Note", icon: "📝" },
        { key: "link", label: "Link", icon: "🔗" },
        { key: "image", label: "Image", icon: "🖼️" },
        { key: "video", label: "Video", icon: "🎬" },
    ];

    return createPortal(
        <div className="fixed inset-[0] z-[100] flex items-end sm:items-center justify-center sm:p-6">
            {/* Cinematic Blur Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-xl transition-all duration-300"
                onClick={resetAndClose}
            />

            {/* Modal Card */}
            <div className="relative w-full max-w-lg bg-[#0a0a0a] sm:border border-white/10 border-t rounded-t-[32px] sm:rounded-3xl shadow-[0_-20px_50px_rgba(0,0,0,0.5)] sm:shadow-2xl overflow-hidden fade-in-up flex flex-col max-h-[92vh] sm:max-h-none">
                {/* Mobile Drag Indicator */}
                <div className="w-full flex justify-center pt-3 pb-1 sm:hidden absolute top-0 z-10">
                    <div className="w-12 h-1.5 bg-white/20 rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between p-6 pt-10 sm:pt-6 border-b border-white/[0.04] shrink-0">
                    <h2 className="text-xl font-medium tracking-tight text-white">
                        Create capture
                    </h2>
                    <button
                        onClick={resetAndClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Input Form Area */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1 pb-safe max-h-[75vh]">
                    {/* Modern Tab Selector */}
                    <div className="flex p-1 bg-white/[0.03] border border-white/5 rounded-2xl">
                        {types.map((t) => (
                            <button
                                key={t.key}
                                type="button"
                                onClick={() => setType(t.key)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${type === t.key
                                    ? "bg-white/10 text-white shadow-sm"
                                    : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                                    }`}
                            >
                                <span className="opacity-80 -mt-0.5">{t.icon}</span>
                                <span className="hidden sm:inline">{t.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4 pt-2">

                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Task Title..."
                            autoFocus
                            className="w-full bg-transparent border-0 border-b border-white/10 px-1 py-3 text-lg text-white placeholder-gray-500 focus:ring-0 focus:border-blue-500 transition-colors"
                        />

                        {(type === "link" || type === "text") && (
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://..."
                                className="w-full bg-transparent border-0 border-b border-white/10 px-1 py-3 text-sm text-blue-400 placeholder-gray-500 focus:ring-0 focus:border-blue-500 transition-colors"
                            />
                        )}

                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add description or notes..."
                            rows={3}
                            className="w-full bg-transparent border-0 border-b border-white/10 px-1 py-3 text-sm text-gray-300 placeholder-gray-600 focus:ring-0 focus:border-blue-500 transition-colors resize-none"
                        />

                        {/* Media Area */}
                        {(type === "image" || type === "video") && (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`mt-4 border border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300
                  ${mediaUrl ? "border-emerald-500/30 bg-emerald-500/5" : "border-white/20 hover:border-white/40 hover:bg-white/5"}
                `}
                            >
                                {isUploading ? (
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        <span className="text-sm font-medium text-gray-400 tracking-wide">Uploading to cloud...</span>
                                    </div>
                                ) : mediaUrl ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-xl">✅</span>
                                        <span className="text-sm font-medium text-emerald-400">
                                            Media ready
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <svg className="w-8 h-8 text-gray-500 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                        </svg>
                                        <span className="text-sm font-medium text-gray-300">
                                            Browse for {type}
                                        </span>
                                        <span className="text-xs text-gray-500 uppercase tracking-wider">Max 50MB</span>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept={type === "image" ? "image/*" : "video/*"}
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {error}
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="pt-6 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={resetAndClose}
                            className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || isUploading || !title.trim()}
                            className="px-6 py-2.5 text-sm font-medium bg-white text-black rounded-full hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                    Saving
                                </>
                            ) : (
                                "Save Task"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
