"use client";

import { useEffect, useState } from "react";
import useTaskStore from "@/lib/store";
import FilterBar from "./FilterBar";
import TaskList from "./TaskList";
import CreateTaskModal from "./CreateTaskModal";

export default function Dashboard() {
    const { fetchTasks, tasks, error, clearError } = useTaskStore();
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const pendingCount = tasks.filter((t) => !t.isCompleted).length;

    return (
        <>
            <div className="ambient-bg" />
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">

                {/* Header Section */}
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 fade-in-up">
                    <div className="space-y-2 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-400 mb-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            Real-time Sync Active
                        </div>
                        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white leading-tight">
                            Capture <span className="text-gray-500">everything.</span> <br />
                            Lose <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">nothing.</span>
                        </h1>
                        <p className="text-gray-400 text-lg mt-4 max-w-xl font-light">
                            {pendingCount > 0
                                ? `You have ${pendingCount} pending task${pendingCount > 1 ? "s" : ""} waiting for your attention.`
                                : "You are all caught up for the day."}
                        </p>
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="group relative inline-flex items-center gap-2 px-6 py-3.5 bg-white text-black font-medium rounded-full shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                    >
                        <svg
                            className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        <span>Capture Target</span>

                        {/* Hover Glow */}
                        <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 blur-md transition-opacity" />
                    </button>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="mb-8 p-4 glass-card border-red-500/30 bg-red-500/5 rounded-2xl flex items-center justify-between fade-in-up">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <p className="text-sm font-medium text-red-200">{error}</p>
                        </div>
                        <button onClick={clearError} className="text-red-400/60 hover:text-red-400 transition-colors p-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                <div className="fade-in-up" style={{ animationDelay: "100ms" }}>
                    {/* Main Content Area */}
                    <div className="mb-6 border-b border-white/5 pb-6">
                        <FilterBar />
                    </div>

                    <div className="min-h-[400px]">
                        <TaskList />
                    </div>
                </div>

                {/* Create Task Modal */}
                <CreateTaskModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                />

                {/* Mobile Sticky FAB */}
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="md:hidden fixed bottom-8 right-6 w-14 h-14 bg-white text-black rounded-full shadow-[0_8px_30px_rgba(255,255,255,0.2)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                </button>
            </div>
        </>
    );
}
