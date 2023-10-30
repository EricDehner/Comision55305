import express from "express";
import __dirname from "./utils.js";
import expressHandlebars from "express-handlebars";
import Handlebars from "handlebars";
import { allowInsecurePrototypeAccess } from '@handlebars/allow-prototype-access';
import { Server } from "socket.io";
import mongoose from "mongoose";
import ProductManager from "./dao/ProductManager.js";
import ChatManager from "./dao/ChatManager.js"
import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import sessionsRouter from "./routes/sessions.router.js"
import emailRouter from "./routes/email.router.js";
import smsRouter from "./routes/sms.router.js";
import viewsRouter from "./routes/view.router.js";
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cookieParser from "cookie-parser";
import passport from "passport";
import DBManager from './mongo/ds.js';
import initializePassport from "./config/passport.config.js";
import { MONGO_URL, SECRET_KEY_SESSION, PORT } from "./config/config.js"

const app = express();
const puerto = process.env.PORT || 8080;

const httpServer = app.listen(puerto, () => {
    console.log("Servidor Activo\nIngrese a http://localhost:" + puerto + "/products");
});
export const socketServer = new Server(httpServer);

const PM = new ProductManager();
const CM = new ChatManager();


app.set("views", __dirname + "/views");
app.engine('handlebars', expressHandlebars.engine({
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    helpers: {
        eq(value1, value2) { return value1 === value2 },
        ejemplo() { return true }
    }
}));
app.set("view engine", "handlebars");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(session({
    secret: process.env.SECRET_KEY_SESSION,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URL,
        collectionName: 'sessions',
        mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true },
        ttl: 300
    }),
}));
app.use(passport.initialize())
app.use(passport.session())
initializePassport()

app.use(express.static(__dirname + "/public"));
app.use("/api/products/", productsRouter);
app.use("/api/carts/", cartsRouter);
app.use("/api/sessions/", sessionsRouter);
app.use('/email', emailRouter);
app.use('/sms', smsRouter);
app.use("/", viewsRouter);

//mongoose.connect(process.env.PORT);
DBManager.connectToMongoDB();

mongoose.connection.on("connected", () => {
    console.log("Conectado a MongoDB");
});

mongoose.connection.on("error", (error) => {
    console.error("Error conectando a MongoDB:", error);
});

socketServer.on("connection", async (socket) => {
    console.log("¡Conexión exitosa!");

    const products = await PM.getProducts();
    socket.emit("realTimeProducts", products);

    socket.on("nuevoProducto", async (data) => {
        const product = { title: data.title, description: data.description, code: data.code, price: data.price, status: data.status, stock: data.stock, category: data.category, thumbnails: data.thumbnails };
        await PM.addProduct(product);
        const products = await PM.getProducts();
        socket.emit("realTimeProducts", products);
    });

    socket.on("eliminarProducto", async (data) => {
        await PM.deleteProduct((data));
        const products = await PM.getProducts();
        socket.emit("realTimeProducts", products);
    });

    socket.on("newMessage", async (data) => {
        CM.createMessage(data);
        const messages = await CM.getMessages();
        socket.emit("messages", messages);
    });
});