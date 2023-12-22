import mongoose from "mongoose";

const ticketProductSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'cart',  // Asegúrate de que coincide con el nombre de tu modelo de productos
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
});

const ticketSchema = new mongoose.Schema({
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
    products: [ticketProductSchema],
});

export const ticketModel = mongoose.model("tickets", ticketSchema);
