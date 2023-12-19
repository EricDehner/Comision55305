import multer from "multer";
import fs from "fs";
import path from "path";
import __dirname from "../utils.js";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder;

        if (file.fieldname === "profileImage") {
            folder = path.join(__dirname, "/uploads/normal/perfil");
        } else if (file.fieldname === "productImage") {
            folder = path.join(__dirname, "/uploads/normal/producto");
        } else if (file.fieldname === "identificationDocument") {
            folder = path.join(__dirname, "/uploads/premium/identificacion");
        } else if (file.fieldname === "domicileProofDocument") {
            folder = path.join(__dirname, "/uploads/premium/domicilio");
        } else if (file.fieldname === "accountStatementDocument") {
            folder = path.join(__dirname, "/uploads/premium/estadoCuenta");
        } else {
            folder = path.join(__dirname, "/uploads/normal/documentos");
        }

        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
        }

        cb(null, folder);
    },

    filename: (req, file, cb) => {
        const fileName = `${Date.now()}-${file.originalname}`;
        cb(null, fileName);
    },
});

const uploadConfig = multer({ storage });

export default uploadConfig;
