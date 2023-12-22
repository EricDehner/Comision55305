import { Router } from "express";
import messageController from "../controllers/messageController.js";

const MC = new messageController();
const messagesRouter = Router();

messagesRouter.put("/:mid/status", MC.changeStatus);


export default messagesRouter;
