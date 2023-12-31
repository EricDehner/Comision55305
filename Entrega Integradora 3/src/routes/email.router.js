import { Router } from "express";
import {sendEmail, sendEmailWithAttachments} from '../controllers/emailController.js';

const emailRouter = Router();

emailRouter.get("/", sendEmail);
emailRouter.get("/attachments", sendEmailWithAttachments);

export default emailRouter;
