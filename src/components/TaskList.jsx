"use client";

import { useState } from "react";
import useTaskStore from "@/lib/store";
import TaskCard from "./TaskCard";
import TaskDetailModal from "./TaskDetailModal";

export default function TaskList() {
    const { getFilteredTasks, isLoading, filter } = useTaskStore();
    const [selectedTask, setSelectedTask] = useState(null);

    const tasks = getFilteredTasks();

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mt-8">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-4 p-4 rounded-2xl border border-[var(--input-border)] bg-foreground/[0.02] animate-pulse"
                    >
                        <div className="w-5 h-5 rounded-[4px] bg-foreground/[0.05] border border-[var(--input-border)]" />
                        <div className="w-16 h-16 rounded-xl bg-foreground/[0.05] shrink-0" />
                        <div className="flex-1 space-y-2.5">
                            <div className="h-4 bg-foreground/[0.05] rounded-md w-1/3" />
                            <div className="h-3 bg-foreground/[0.05] rounded-md w-2/3" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 px-4 fade-in-up">
                <div className="relative mb-6 group">
                    <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="relative w-24 h-24 rounded-3xl bg-foreground/[0.05] border border-[var(--input-border)] flex items-center justify-center backdrop-blur-xl">
                        <svg
                            className="w-10 h-10 text-gray-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                    </div>
                </div>
                <h3 className="text-xl font-medium tracking-tight text-foreground mb-2">
                    {filter === "completed" ? "No completed tasks yet" : filter === "pending" ? "You're all caught up" : "Your space is empty"}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-500 text-center max-w-sm font-light leading-relaxed">
                    {filter === "all" ? "Capture links, images, and notes from any device to seamlessly build your knowledge base." : "Try changing your filters or capturing something new to get started."}
                </p>
            </div>
        );
    }

    return (
        <div className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                {tasks.map((task, index) => (
                    <div
                        key={task._id}
                        className="fade-in-up"
                        style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
                    >
                        <TaskCard
                            task={task}
                            onClick={() => setSelectedTask(task)}
                        />
                    </div>
                ))}
            </div>

            <TaskDetailModal
                task={selectedTask}
                isOpen={!!selectedTask}
                onClose={() => setSelectedTask(null)}
            />
        </div>
    );
}
