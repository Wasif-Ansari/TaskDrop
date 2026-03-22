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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4 md:mt-8">
            {/* Segmented Control Filter */}
            <div className="flex w-full md:w-auto items-center p-1 glass-card rounded-xl overflow-x-auto hide-scrollbar">
                {filters.map((f) => {
                    const isActive = filter === f.key;
                    return (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={`flex-1 md:flex-none relative flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 text-[13px] sm:text-sm font-semibold transition-all duration-300 rounded-xl whitespace-nowrap ${isActive ? "text-foreground" : "text-gray-500 hover:text-foreground"
                                }`}
                        >
                            {isActive && (
                                <div className="absolute inset-0 bg-foreground/[0.08] dark:bg-foreground/[0.05] rounded-[10px] shadow-sm border border-foreground/10" />
                            )}
                            <span className="relative z-10">{f.label}</span>
                            <span
                                className={`relative z-10 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] rounded-lg border
                  ${isActive
                                        ? "bg-foreground/10 border-foreground/10 text-foreground"
                                        : "bg-transparent border-foreground/5 text-gray-500"
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
                        className="w-full py-2.5 pr-4 bg-transparent text-sm text-foreground mb-0.5 placeholder-gray-500 focus:outline-none"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="px-3 text-gray-400 hover:text-foreground"
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
