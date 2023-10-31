import { fileURLToPath } from "url"
import { dirname } from "path"
import bcrypt from "bcrypt"
import passport from "passport";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from './config/config.js';

export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10))
export const isValidPassword = (user, password) => bcrypt.compareSync(password, user.password)

export const passportCall = (strategy) => {

    return async (req, res, next) => {
        console.log('Inicio de la autenticación');
        if (strategy === "jwt") {
            console.log("req.headers.authorization",req.headers.authorization);
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                console.log("no autorizado");
                return res.status(401).json({ message: "no estas autorizado" });
            }
            const token = authHeader.split(" ")[1];

            if (!token) {
                console.log("no autorizado");
                return res.status(401).json({ message: "no estas autorizado" });
            }

            jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
                if (err) {
                    console.log(err);
                    return res.status(401).json({ message: "no estas autorizado" });
                }
                req.user = user;
                next();
            });
        };
        if (strategy !== "jwt") {

            console.log("diferente")
            passport.authenticate(strategy, function (error, user, info) {
                console.log('Autenticación en proceso', req.user);

                if (error) {
                    console.error('Error durante la autenticación', error);
                    return next(error);
                }

                if (!user) {
                    console.log('Autenticación fallida');
                    return res.status(401).send({ error: info.messages ? info.messages : info.toString() });
                }

                req.user = user;
                console.log('Autenticación exitosa');
                next();
            })(req, res, next);
        };
    }
};

export const authorization = (roles) => {
    return async (req, res, next) => {
        if (!req.user) {
            console.log('User is not authenticated');
            return res
                .status(401)
                .send({ status: "error", message: "Unauthorizated" });
        }

        if (!roles.includes(req.user.role)) {
            console.log('User does not have the required role');
            return res
                .status(403)
                .send({ status: "error", message: "No permissions" });
        }

        next();
    };
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)

export default __dirname