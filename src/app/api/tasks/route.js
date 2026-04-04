import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Task from "@/models/Task";
import { fetchLinkPreview } from "@/lib/linkPreview";
import {
    getCachedTaskList,
    invalidateTaskListCache,
    setCachedTaskList,
} from "@/lib/taskCache";

// GET /api/tasks - List all tasks
export async function GET() {
    try {
        const cachedTasks = await getCachedTaskList();

        if (cachedTasks) {
            return NextResponse.json({ tasks: cachedTasks }, { status: 200 });
        }

        await dbConnect();

        const tasks = await Task.find({})
            .sort({ createdAt: -1 })
            .lean();

        await setCachedTaskList(tasks);

        return NextResponse.json({ tasks }, { status: 200 });
    } catch (error) {
        console.error("GET /api/tasks error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST /api/tasks - Create a new task
export async function POST(request) {
    try {
        await dbConnect();

        const body = await request.json();
        const { title, description, url, mediaUrl, type, files } = body;

        if (!title) {
            return NextResponse.json(
                { error: "Title is required" },
                { status: 400 }
            );
        }

        let linkPreview = {};
        if (type === "link" && url) {
            linkPreview = await fetchLinkPreview(url);
        }

        // Support both legacy mediaUrl and new files array
        const taskFiles = files || [];

        const task = await Task.create({
            title: linkPreview.title || title,
            description: description || linkPreview.description || "",
            url: url || "",
            mediaUrl: mediaUrl || linkPreview.image || "",
            type: type || "text",
            linkPreview,
            files: taskFiles,
        });

        await invalidateTaskListCache();

        return NextResponse.json({ task }, { status: 201 });
    } catch (error) {
        console.error("POST /api/tasks error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
