import { Router } from "express";
import ProductManager from "../managers/ProductManager.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pmanager = new ProductManager(__dirname + "/files/products.json");
const router = Router();

//Obtiene la lista de productos
router.get("/", async(req,res)=>{
    const listaProductos = await pmanager.getProducts({});
    res.render("home", {listaProductos});
});

//Acceso al formulario
router.get("/realtimeProducts", (req,res)=>{
    res.render("realtimeProducts");
});

export default router;
