import { Router } from "express";
import UserController from "../controllers/userController.js";
import uploadConfig from "../config/multer.config.js";
import { passportCall, authorization } from "../utils.js";

const userController = new UserController();
const usersRouter = Router();

usersRouter.post("/:uid/documents", passportCall("jwt"), authorization(["admin", "premium", "user"]), uploadConfig.fields([{ name: "profileImage", maxCount: 1 }, { name: "productImage", maxCount: 1 }, { name: "document", maxCount: 1 },]), userController.uploadFiles);

usersRouter.post("/:uid/premium-documents", passportCall("jwt"), authorization(["admin", "premium", "user"]), uploadConfig.fields([{ name: "identificationDocument", maxCount: 1 }, { name: "domicileProofDocument", maxCount: 1 }, { name: "accountStatementDocument", maxCount: 1 },]), userController.uploadPremiumDocuments);

usersRouter.post("/premium/:uid", passportCall("jwt"), authorization(["admin", "premium", "user"]), userController.upgradeToPremium);

usersRouter.delete("/inactive", passportCall("jwt"), authorization(["admin"]), userController.deleteInactiveUsers);

usersRouter.delete("/deleteUser/:uid", passportCall("jwt"), authorization(["admin"]), userController.deleteUsers);

usersRouter.put("/:uid/role", passportCall("jwt"), authorization(["admin"]), userController.changeRole);


export default usersRouter;
