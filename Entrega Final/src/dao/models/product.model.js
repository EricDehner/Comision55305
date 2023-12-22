import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2"

const productSchema = new mongoose.Schema({
    title: String,
    description: String,
    code: String,
    price: Number,
    status: Boolean,
    stock: Number,
    category: String,
    thumbnails: Array,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    }
});

productSchema.plugin(mongoosePaginate);

export const productModel = mongoose.model("products", productSchema);