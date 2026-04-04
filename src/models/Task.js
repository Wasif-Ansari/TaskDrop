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
            enum: ["link", "image", "video", "text", "file"],
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
        files: [
            {
                name: { type: String, required: true },
                url: { type: String, required: true },
                publicId: { type: String, required: true },
                size: { type: Number, default: 0 },
                type: { type: String, default: "" },
                resourceType: { type: String, default: "raw" },
                uploadedAt: { type: Date, default: Date.now },
            },
        ],
    },
    {
        timestamps: true,
    }
);

TaskSchema.index({ createdAt: -1 });
TaskSchema.index({ isCompleted: 1 });

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);
