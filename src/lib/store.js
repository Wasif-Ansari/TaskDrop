"use client";

import { create } from "zustand";

const useTaskStore = create((set, get) => ({
    tasks: [],
    filter: "all",
    searchQuery: "",
    isLoading: false,
    error: null,

    setFilter: (filter) => set({ filter }),
    setSearchQuery: (searchQuery) => set({ searchQuery }),

    // Fetch tasks from API
    fetchTasks: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch("/api/tasks");
            if (!res.ok) throw new Error("Failed to fetch tasks");
            const data = await res.json();
            set({ tasks: data.tasks, isLoading: false });
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    // Add a new task (optimistic)
    addTask: async (taskData) => {
        const tempId = `temp-${Date.now()}`;
        const optimisticTask = {
            _id: tempId,
            ...taskData,
            isCompleted: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Optimistic update
        set((state) => ({ tasks: [optimisticTask, ...state.tasks] }));

        try {
            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(taskData),
            });

            if (!res.ok) throw new Error("Failed to create task");

            const data = await res.json();
            // Replace optimistic task with real one
            set((state) => ({
                tasks: state.tasks.map((t) => (t._id === tempId ? data.task : t)),
            }));
            return data.task;
        } catch (error) {
            // Rollback optimistic update
            set((state) => ({
                tasks: state.tasks.filter((t) => t._id !== tempId),
                error: error.message,
            }));
            throw error;
        }
    },

    // Toggle task completion (optimistic)
    toggleTask: async (taskId) => {
        const currentTasks = get().tasks;
        const task = currentTasks.find((t) => t._id === taskId);
        if (!task) return;

        // Optimistic update
        set((state) => ({
            tasks: state.tasks.map((t) =>
                t._id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
            ),
        }));

        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isCompleted: !task.isCompleted }),
            });

            if (!res.ok) throw new Error("Failed to update task");

            const data = await res.json();
            set((state) => ({
                tasks: state.tasks.map((t) => (t._id === taskId ? data.task : t)),
            }));
        } catch (error) {
            // Rollback
            set((state) => ({
                tasks: state.tasks.map((t) =>
                    t._id === taskId ? { ...t, isCompleted: task.isCompleted } : t
                ),
                error: error.message,
            }));
        }
    },

    // Delete task (optimistic)
    deleteTask: async (taskId) => {
        const currentTasks = get().tasks;

        // Optimistic update
        set((state) => ({
            tasks: state.tasks.filter((t) => t._id !== taskId),
        }));

        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete task");
        } catch (error) {
            // Rollback
            set({ tasks: currentTasks, error: error.message });
        }
    },

    // Update task
    updateTask: async (taskId, updates) => {
        const currentTasks = get().tasks;

        // Optimistic
        set((state) => ({
            tasks: state.tasks.map((t) =>
                t._id === taskId ? { ...t, ...updates } : t
            ),
        }));

        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });

            if (!res.ok) throw new Error("Failed to update task");

            const data = await res.json();
            set((state) => ({
                tasks: state.tasks.map((t) => (t._id === taskId ? data.task : t)),
            }));
        } catch (error) {
            set({ tasks: currentTasks, error: error.message });
        }
    },

    // Get filtered tasks
    getFilteredTasks: () => {
        const { tasks, filter, searchQuery } = get();
        let filtered = [...tasks];

        // Apply filter
        if (filter === "pending") {
            filtered = filtered.filter((t) => !t.isCompleted);
        } else if (filter === "completed") {
            filtered = filtered.filter((t) => t.isCompleted);
        }

        // Apply search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (t) =>
                    t.title?.toLowerCase().includes(q) ||
                    t.description?.toLowerCase().includes(q) ||
                    t.url?.toLowerCase().includes(q)
            );
        }

        return filtered;
    },

    clearError: () => set({ error: null }),
}));

export default useTaskStore;
