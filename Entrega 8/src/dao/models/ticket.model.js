import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
    id: Number,
    purchase_datetime: {
        type: String
    },
    code: {
        type: String,
        require: true,
        unique: true
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

