import { Router } from "express";
import { sendEmail, sendEmailWithAttachments } from '../controllers/emailController.js';
import { passportCall, authorization } from "../utils.js";

const emailRouter = Router();

emailRouter.get("/", passportCall("jwt"), authorization(["admin"]), sendEmail);

emailRouter.get("/attachments", passportCall("jwt"), authorization(["admin"]), sendEmailWithAttachments);

export default emailRouter;
