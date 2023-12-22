import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    user: String,
    email: String,
    message: String,
    date: Date,
    status: {
        type: String,
        default: "pending"
    }
});

export const messageModel = mongoose.model("messages", messageSchema);