import { Router } from "express";
import ProductManager from "../ProductManager.js";

const productsRouter = Router();
const PM = new ProductManager();

productsRouter.get("/", (req, res) => {
    const products = PM.getProducts();
    let { limit } = req.query;

    res.send({ products: limit ? products.slice(0, limit) : products });
});

productsRouter.get("/:pid", (req, res) => {
    const products = PM.getProducts();
    let pid = Number(req.params.pid);

    res.send({ product: products.find(item => item.id === pid) || "Error! El ID de Producto no existe!" });
});

productsRouter.post("/", async (req, res) => {
    const result = await PM.addProduct(req.body);
    const requiredFields = [
        { field: "title", message: "Title" },
        { field: "description", message: "Description" },
        { field: "code", message: "Code" },
        { field: "price", message: "Price" },
        { field: "stock", message: "Stock" },
        { field: "category", message: "Category" },
        { field: "thumbnails", message: "Thumbnails" }
    ];

    for (const { field, message } of requiredFields) {
        if (!req.body[field]) {
            return res.status(400).send({ status: "error", message: `Error! No se cargó el campo ${message}!` });
        }
    }

    if (!Array.isArray(req.body.thumbnails) || req.body.thumbnails.length === 0) {
        return res.status(400).send({ status: "error", message: "Error! Debe ingresar al menos una imagen en el Array Thumbnails!" });
    }

    req.body.status = typeof req.body.status === "undefined" && true;

    if (result) {
        res.send({ status: "ok", message: "El Producto se agregó correctamente!" });
    } else {
        res.status(500).send({ status: "error", message: "Error! No se pudo agregar el Producto!" });
    }
});

productsRouter.put("/:pid", async (req, res) => {
    const pid = Number(req.params.pid);
    const { title, description, code, price, status, stock, category, thumbnails } = req.body;
    const requiredFields = ["title", "description", "code", "price", "stock", "category", "thumbnails"];

    for (const field of requiredFields) {
        if (!req.body[field]) {
            return res.status(400).send({ status: "error", message: `Error! No se cargó el campo ${field.charAt(0).toUpperCase() + field.slice(1)}!` });
        }
    }

    req.body.status = typeof req.body.status === "undefined" && true;

    if (!Array.isArray(thumbnails) || thumbnails.length === 0) {
        return res.status(400).send({ status: "error", message: "Error! Debe ingresar al menos una imagen en el Array Thumbnails!" });
    }

    const result = await PM.updateProduct(pid, { title, description, code, price, status, stock, category, thumbnails });
    if (result) {
        res.send({ status: "ok", message: "El Producto se actualizó correctamente!" });
    } else {
        res.status(500).send({ status: "error", message: "Error! No se pudo actualizar el Producto!" });
    }
});

productsRouter.delete("/:pid", async (req, res) => {
    let pid = Number(req.params.pid);
    const result = await PM.deleteProduct(pid)

    if (result) {
        res.send({ status: "ok", message: "El Producto se eliminó correctamente!" });
    } else {
        res.status(500).send({ status: "error", message: "Error! No se pudo eliminar el Producto!" });
    }
});

export default productsRouter;