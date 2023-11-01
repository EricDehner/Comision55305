import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
    id: Number,
    purchase_datetime: {
        type: String
    },
    amount: {
        type: Number,
        required: true,
    },
    purchaser: {
        type: String,
        required: true,
        ref: "user",
    },
});

export const ticketModel = mongoose.model("tickets", ticketSchema);

