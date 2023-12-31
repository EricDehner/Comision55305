import UserService from "../services/userService.js";
import UserResponse from "../dao/dto/user.response.dto.js";
import CustomError from "../services/errors/customError.js";
import { generateUserErrorInfo } from "../services/errors/messages/user.creation.error.js";
import EErrors from "../services/errors/errors-enum.js";
import { createHash } from "../utils.js";
import { userModel } from "../dao/models/user.model.js";

class UserController {
    constructor() {
        this.userService = new UserService();
    }

    async register(req, res, next) {
        try {
            const { first_name, last_name, email, age, password, role, last_connection } = req.body;

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
                role,
                last_connection
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

            // Función auxiliar para agregar o actualizar un archivo en documentos
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
        console.log("uploadPremiumDocuments llamado", req.body);

        try {
            const userId = req.params.uid;
            const files = req.files;
            const user = await userModel.findById(userId);

            if (!user) {
                return res.status(404).send("Usuario no encontrado.");
            }

            // Función auxiliar para actualizar o agregar un documento
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

            // Actualizar los documentos premium en el usuario
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
}

export default UserController;
