import UserService from "../services/userService.js";
import UserResponse from "../dao/dto/user.response.dto.js";
import CustomError from "../services/errors/customErrorMsg.js";
import { generateUserErrorInfo } from "../services/errors/messages/user.creation.error.js";
import EErrors from "../services/errors/errors-enum.js";
import { createHash } from "../utils.js";
import { userModel } from "../dao/models/user.model.js";
import { transporter } from "./emailController.js";
import { ENV_CONFIG } from "../config/config.js";

class UserController {
    constructor() {
        this.userService = new UserService();
    }

    async register(req, res, next) {
        try {
            const { first_name, last_name, email, age, password, role } = req.body;

            if (!first_name || !last_name || !email || !age || !password) {
                const customError = new CustomError({
                    name: "Error en la creación del usuario.",
                    cause: generateUserErrorInfo({
                        first_name,
                        last_name,
                        age,
                        email,
                        password,
                        role,
                    }),
                    message: "Error tratando de crear el usuario",
                    code: 400,
                });
                return next(customError);
            }

            const response = await this.userService.registerUser({
                first_name,
                last_name,
                email,
                age,
                password,
                role
            });

            if (response.status === "success") {
                req.logger.info("Usuario creado con éxito.");
            } else {
                req.logger.error("Usuario ya existente.");
            }
            return res.status(200).json(response);
        } catch (error) {
            req.logger.error("Error registrando usuario.", error)
            return next(error);
        }
    }

    async restorePassword(req, res, next) {
        try {
            const { user, pass } = req.query;
            const passwordRestored = await this.userService.restorePassword(user, createHash(pass));
            if (passwordRestored) {
                req.logger.info("Contraseña actualizada con exito.")
                return res.send({ status: "OK", message: "¡La contraseña se ha actualizado correctamente!" });
            } else {
                const customError = new CustomError({
                    name: "Error al actualizar contraseña",
                    message: "No se pudo actualizar la contraseña.",
                    code: EErrors.PASSWORD_RESTORATION_ERROR,
                });
                return next(customError);
            }
        } catch (error) {
            req.logger.error(error);
            return next(error);
        }
    }

    currentUser(req, res, next) {
        if (req.session.user) {
            return res.send({ status: "OK", payload: new UserResponse(req.session.user) });
        } else {
            const customError = new CustomError({
                name: "Error al autorizar",
                message: "No se pudo autorizar al usuario.",
                code: EErrors.AUTHORIZATION_ERROR,
            });
            return next(customError);
        }
    }

    async updateUserDocuments(req, res) {
        try {
            const userId = req.params.uid;
            const file = req.file;

            if (!file) {
                return res.status(400).send("No file uploaded.");
            }

            const document = {
                name: file.originalname,
                string: file.path,
            };

            await userModel.findByIdAndUpdate(userId, {
                $push: { documents: document },
                $set: { last_connection: new Date() },
            });

            res.status(200).send("Document uploaded successfully.");
        } catch (error) {
            res.status(500).send(error.message);
        }
    }

    async uploadFiles(req, res) {
        try {
            const userId = req.params.uid;
            const files = req.files;
            const user = await userModel.findById(userId);

            if (!user) {
                return res.status(404).send("Usuario no encontrado.");
            }

            const addOrUpdateFile = (file, fileName) => {
                const existingIndex = user.documents.findIndex(
                    (doc) => doc.name === fileName
                );
                const fileData = {
                    name: fileName,
                    reference: file.path,
                    status: "Uploaded",
                };

                if (existingIndex >= 0) {
                    user.documents[existingIndex] = fileData;
                } else {
                    user.documents.push(fileData);
                }
            };

            if (files.profileImage && files.profileImage.length > 0) {
                addOrUpdateFile(files.profileImage[0], "profileImage");
            }

            if (files.productImage && files.productImage.length > 0) {
                addOrUpdateFile(files.productImage[0], "productImage");
            }

            if (files.document) {
                files.document.forEach((doc) => {
                    addOrUpdateFile(doc, doc.originalname);
                });
            }

            await user.save();
            req.logger.info("¡Archivos cargados con éxito!")

            res.json({ status: "success", message: "¡Archivos cargados con éxito!" });
        } catch (error) {
            req.logger.error("Error cargando archivos:", error);
            res.status(500).send("Error interno del servidor.");
        }
    }

    async upgradeToPremium(req, res) {
        try {
            const userId = req.params.uid;
            const user = await userModel.findById(userId);
            if (!user) {
                return res.status(404).send("Usuario no encontrado.");
            }

            const requiredDocs = [
                "identificationDocument",
                "domicileProofDocument",
                "accountStatementDocument",
            ];
            const hasAllDocuments = requiredDocs.every((docName) =>
                user.documents.some(
                    (doc) => doc.name === docName && doc.status === "Uploaded"
                )
            );

            if (hasAllDocuments) {
                user.isPremium = true;
                user.role = "premium";
                await user.save();

                req.session.user = {
                    ...req.session.user,
                    role: "premium",
                };

                res.status(200).send("Cuenta actualizada a premium.");
            } else {
                res.status(400).send("Documentos requeridos no están completos.");
            }
        } catch (error) {
            console.error(error);
            res.status(500).send("Error interno del servidor.");
        }
    }

    async uploadPremiumDocuments(req, res) {
        try {
            const userId = req.params.uid;
            const files = req.files;
            const user = await userModel.findById(userId);

            if (!user) {
                return res.status(404).send("Usuario no encontrado.");
            }

            const updateOrAddDocument = (docName, file) => {
                const existingDocIndex = user.documents.findIndex(
                    (doc) => doc.name === docName
                );
                const documentData = {
                    name: docName,
                    reference: file.path,
                    status: "Uploaded",
                };

                if (existingDocIndex >= 0) {
                    user.documents[existingDocIndex] = documentData;
                } else {
                    user.documents.push(documentData);
                }
            };

            if (files.identificationDocument) {
                updateOrAddDocument(
                    "identificationDocument",
                    files.identificationDocument[0]
                );
            }

            if (files.domicileProofDocument) {
                updateOrAddDocument(
                    "domicileProofDocument",
                    files.domicileProofDocument[0]
                );
            }

            if (files.accountStatementDocument) {
                updateOrAddDocument(
                    "accountStatementDocument",
                    files.accountStatementDocument[0]
                );
            }

            await user.save();
            res.json({ message: "¡Archivos cargados exitosamente!" });
        } catch (error) {
            console.error(error);
            res.status(500).send("Error interno del servidor.");
        }
    }

    async deleteInactiveUsers(req, res, next) {
        try {
            const inactiveThreshold = new Date();
            inactiveThreshold.setDate(inactiveThreshold.getDate() - 2);

            const result = await userModel.find({
                last_connection: { $lt: inactiveThreshold },
                role: { $ne: "admin" }
            });

            const deletedCount = result.length;

            for (const user of result) {
                const mailOptions = {
                    from: "Proyecto E-Commerce " + ENV_CONFIG.EMAIL_USER,
                    to: user.email,
                    subject: "Su cuenta ha sido eliminada por inactividad",
                    html: `<p>Hola, ${user.first_name}. Te informamos que tu cuenta ha sido eliminada de nuestra base de datos por inactividad. <br> Nos encantaría que vuelas, ¡te esperamos! <br> Saludos. </p>`,
                };

                await transporter.sendMail(mailOptions);

                await userModel.findByIdAndDelete(user._id);
            }

            res.status(200).json({ success: true, message: `${deletedCount} usuarios eliminados.` });
        } catch (error) {
            console.error("Error eliminando usuarios inactivos:", error);
            res.status(500).json({ success: false, message: "Error interno del servidor." });
        }
    }

    async deleteUsers(req, res) {
        try {
            const { userId } = req.body;

            if (!userId) {
                return res.status(400).json({ success: false, message: "Se requiere el ID del usuario." });
            }

            await userModel.findByIdAndDelete(userId);

            return res.status(200).json({ success: true, message: "Usuario eliminado con éxito." });
        } catch (error) {
            console.error("Error eliminando usuario:", error);
            return res.status(500).json({ success: false, message: "Error interno del servidor." });
        }
    }

    async changeRole(req, res) {
        try {
            const userId = req.params.uid;
            const { role } = req.body;

            const user = await userModel.findById(userId);

            if (!user) {
                return res.status(404).json({ success: false, message: "Usuario no encontrado." });
            }

            user.role = role;
            await user.save();

            res.status(200).json({ success: true, message: "Rol de usuario actualizado con éxito." });
        } catch (error) {
            console.error("Error actualizando rol de usuario:", error);
            res.status(500).json({ success: false, message: "Error interno del servidor." });
        }
    }
}

export default UserController;
