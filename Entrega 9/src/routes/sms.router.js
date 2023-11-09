import { Router } from "express";
import { sendSMS } from "../controllers/smsController.js";

const smsRouter = Router();

smsRouter.get("/", sendSMS);

export default smsRouter;
