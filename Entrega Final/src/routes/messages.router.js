import { Router } from "express";
import messageController from "../controllers/messageController.js";
import { passportCall, authorization } from "../utils.js";

const MC = new messageController();
const messagesRouter = Router();

messagesRouter.put("/:mid/status", passportCall("jwt"), authorization(["admin"]), MC.changeStatus);

messagesRouter.delete("/removeOldSolved", passportCall("jwt"), authorization(["admin"]), MC.removeOldSolvedMessages);

export default messagesRouter;
