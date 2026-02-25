import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Task from "@/models/Task";

// PATCH /api/tasks/:id - Update a task
export async function PATCH(request, { params }) {
    try {
        await dbConnect();

        const { id } = await params;
        const body = await request.json();

        const task = await Task.findOneAndUpdate(
            { _id: id },
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!task) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        return NextResponse.json({ task }, { status: 200 });
    } catch (error) {
        console.error("PATCH /api/tasks/:id error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

// DELETE /api/tasks/:id - Delete a task
export async function DELETE(request, { params }) {
    try {
        await dbConnect();

        const { id } = await params;

        const task = await Task.findOneAndDelete({ _id: id });

        if (!task) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Task deleted" }, { status: 200 });
    } catch (error) {
        console.error("DELETE /api/tasks/:id error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
