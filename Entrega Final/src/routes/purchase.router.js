import { Router } from "express";
import { passportCall, authorization } from "../utils.js";
import purchaseController from "../controllers/purchaseController.js";

const purchasesRouter = Router();

purchasesRouter.get("/purchase", passportCall("jwt"), authorization(["admin"]), purchaseController.getPurchase.bind(purchaseController));

export default purchasesRouter;
