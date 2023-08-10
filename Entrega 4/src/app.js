import express from "express";
import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import viewRouter from "./routes/view.routes.js";
import handlerbars from "express-handlebars";
import __dirname from "./utils.js";
import { Server, Socket } from "socket.io";


const app = express();
const puerto = 8080;

app.engine("handlebars", handlerbars.engine());
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");
app.use(express.static(__dirname + "/public"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/products/", productsRouter);
app.use("/api/carts/", cartsRouter);
app.use("/", viewRouter);


const httpServer=app.listen(puerto, () => {
    console.log("Servidor Activo en el puerto: " + puerto);
});
const socketServer = new Server(httpServer);

import ProductManager from "./managers/ProductManager.js";
const PM = new ProductManager(__dirname + "./files/products.json");

//Primero recibe una nueva coneccion de usuario y da un ID para este, luego permite desde el formulario agregar o quitar productos de la lista
socketServer.on("connection", async (socket) => {
    console.log("Cliente conectado con ID: ", socket.id);
    const listadeproductos = await PM.getProducts({});
    socketServer.emit("envioDeProductos", listadeproductos);

    socket.on("addProduct", async (obj) => {
        await PM.addProduct(obj);
        const listadeproductos = await PM.getProducts({});
        socketServer.emit("envioDeProductos", listadeproductos);
    });

    socket.on("deleteProduct", async (id) => {
        console.log(id)
        await PM.deleteProduct(id)
        const listadeproductos = await PM.getProducts({})
        socketServer.emit("envioDeProducts", listadeproductos)
    })
});
