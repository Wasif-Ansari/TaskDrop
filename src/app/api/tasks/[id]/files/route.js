import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Task from "@/models/Task";
import { invalidateTaskListCache } from "@/lib/taskCache";

// POST /api/tasks/:id/files - Attach files to a task
export async function POST(request, { params }) {
    try {
        await dbConnect();

        const { id } = await params;
        const body = await request.json();
        const { file } = body;

        if (!file || !file.url) {
            return NextResponse.json(
                { error: "File object with url is required" },
                { status: 400 }
            );
        }

        const task = await Task.findByIdAndUpdate(
            id,
            {
                $push: {
                    files: {
                        name: file.name || "file",
                        url: file.url,
                        publicId: file.publicId || "",
                        size: file.size || 0,
                        type: file.type || "",
                        resourceType: file.resourceType || "raw",
                        uploadedAt: new Date(),
                    },
                },
            },
            { new: true, runValidators: true }
        );

        if (!task) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        await invalidateTaskListCache();

        return NextResponse.json({ task }, { status: 200 });
    } catch (error) {
        console.error("POST /api/tasks/:id/files error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

// DELETE /api/tasks/:id/files/:fileIndex - Remove a file from task
export async function DELETE(request, { params }) {
    try {
        await dbConnect();

        const { id, fileIndex } = await params;
        const index = parseInt(fileIndex, 10);

        if (isNaN(index) || index < 0) {
            return NextResponse.json(
                { error: "Invalid file index" },
                { status: 400 }
            );
        }

        const task = await Task.findById(id);

        if (!task) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        if (index >= task.files.length) {
            return NextResponse.json(
                { error: "File index out of range" },
                { status: 400 }
            );
        }

        // Remove file at index
        task.files.splice(index, 1);
        await task.save();

        await invalidateTaskListCache();

        return NextResponse.json({ task }, { status: 200 });
    } catch (error) {
        console.error("DELETE /api/tasks/:id/files/:fileIndex error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
