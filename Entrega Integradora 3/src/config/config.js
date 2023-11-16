import dotenv from "dotenv"
import { Command } from "commander";

const program = new Command();

program
    .option("-p <port>", "Puerto del servidor", 9090)
    .option("--mode <mode>", "Modo de trabajo", "development")
    .parse(process.argv);

const ENVIRONMENT = program.opts().mode;

dotenv.config({
    path:
        ENVIRONMENT === "production"
            ? "./src/config/.env.production"
            : "./src/config/.env.development",
});

export const ENV_CONFIG = {
    ENVIRONMENT: ENVIRONMENT,
    PORT: process.env.PORT,
    MONGO_URL: process.env.MONGO_URL,
    SECRET_KEY_SESSION: process.env.SECRET_KEY_SESSION,
    JWT_SECRET: process.env.JWT_SECRET,
    CLIENT_ID_GITHUB: process.env.CLIENT_ID_GITHUB,
    CLIENT_SECRET_GITHUB: process.env.CLIENT_SECRET_GITHUB,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    PERSISTENCE: process.env.PERSISTENCE,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_SMS_NUMBER: process.env.TWILIO_SMS_NUMBER
};

export default{
    environment: ENVIRONMENT
}