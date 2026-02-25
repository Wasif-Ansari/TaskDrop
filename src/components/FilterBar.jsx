"use client";

import useTaskStore from "@/lib/store";
import { useState } from "react";

const filters = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "completed", label: "Completed" },
];

export default function FilterBar() {
    const { filter, setFilter, searchQuery, setSearchQuery, tasks } = useTaskStore();
    const [isFocused, setIsFocused] = useState(false);

    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter((t) => !t.isCompleted).length;
    const completedTasks = tasks.filter((t) => t.isCompleted).length;

    const counts = {
        all: totalTasks,
        pending: pendingTasks,
        completed: completedTasks,
    };

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-8">
            {/* Segmented Control Filter */}
            <div className="flex items-center p-1 glass-card rounded-xl">
                {filters.map((f) => {
                    const isActive = filter === f.key;
                    return (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={`relative flex items-center justify-center gap-2 px-5 py-2 text-sm font-medium transition-all duration-300 rounded-lg ${isActive ? "text-white" : "text-gray-400 hover:text-gray-200"
                                }`}
                        >
                            {isActive && (
                                <div className="absolute inset-0 bg-white/10 rounded-lg shadow-sm border border-white/10" />
                            )}
                            <span className="relative z-10">{f.label}</span>
                            <span
                                className={`relative z-10 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] rounded-md border
                  ${isActive
                                        ? "bg-white/20 border-white/10 text-white"
                                        : "bg-transparent border-white/5 text-gray-500"
                                    }
                `}
                            >
                                {counts[f.key]}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Modern Search Input */}
            <div className="relative w-full md:max-w-xs group">
                <div
                    className={`absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-violet-500/20 blur-md transition-opacity duration-300 ${isFocused ? "opacity-100" : "opacity-0"
                        }`}
                />
                <div className="relative flex items-center glass-card rounded-xl overflow-hidden focus-within:border-white/30 transition-colors">
                    <div className="pl-4 pr-2 text-gray-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className="w-full py-2.5 pr-4 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="px-3 text-gray-400 hover:text-white"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
