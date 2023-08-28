import express from "express";
import __dirname from "./utils.js";
import handlerbars from "express-handlebars";
import viewRouter from "./routes/view.routes.js";
import { Server } from "socket.io";
import ProductManager from "./dao/ProductManager.js";
import ChatManager from "./dao/ChatManager.js"
import mongoose from "mongoose";

import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";

const app = express();
const puerto = 8080;
const httpServer = app.listen(puerto, () => {
    console.log("Servidor Activo en el puerto: " + puerto);
});

const socketServer = new Server(httpServer);
const PM = new ProductManager();
const CM = new ChatManager();

app.engine("handlebars", handlerbars.engine());
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");
app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/products/", productsRouter);
app.use("/api/carts/", cartsRouter);
app.use("/", viewRouter);

mongoose.connect("mongodb+srv://EricDehnerDB:E40021022RIC@ericdehner.8ulp8hy.mongodb.net/ecommerce?retryWrites=true&w=majority")

socketServer.on("connection", async (socket) => {
    console.log("¡Conexión exitosa!");

    const products = await PM.getProducts();
    socket.emit("realTimeProducts", products);

    socket.on("nuevoProducto", async (data) => {
        const product = { title: data.title, description: data.description, code: data.code, price: data.price, status: data.status, stock: data.stock, category: data.category, thumbnails: data.thumbnails };
        await PM.addProduct(product);
        const products = PM.getProducts();
        socket.emit("realTimeProducts", products);
    });

    socket.on("eliminarProducto", async (data) => {
        await PM.deleteProduct((data)); 
        const products = PM.getProducts();
        socket.emit("realTimeProducts", products);
    });

    socket.on("newMessage", async (data) => {
        CM.createMessage(data);
        const messages = await CM.getMessages();
        socket.emit("messages", messages);
    });
});