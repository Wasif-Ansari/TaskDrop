import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
            maxlength: [500, "Title cannot exceed 500 characters"],
        },
        description: {
            type: String,
            trim: true,
            default: "",
            maxlength: [5000, "Description cannot exceed 5000 characters"],
        },
        url: {
            type: String,
            trim: true,
            default: "",
        },
        mediaUrl: {
            type: String,
            trim: true,
            default: "",
        },
        type: {
            type: String,
            enum: ["link", "image", "video", "text"],
            default: "text",
        },
        isCompleted: {
            type: Boolean,
            default: false,
        },
        linkPreview: {
            title: { type: String, default: "" },
            description: { type: String, default: "" },
            image: { type: String, default: "" },
            siteName: { type: String, default: "" },
        },
    },
    {
        timestamps: true,
    }
);

TaskSchema.index({ createdAt: -1 });
TaskSchema.index({ isCompleted: 1 });

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);
