import twilio from 'twilio';
import { ENV_CONFIG } from '../config/config.js';

const twilioClient = twilio(ENV_CONFIG.TWILIO_ACCOUNT_SID, ENV_CONFIG.TWILIO_AUTH_TOKEN);
const twilioSMSOptions = {
    body: "Esto es un mensaje SMS de prueba usando Twilio desde Coderhouse.",
    from: ENV_CONFIG.TWILIO_SMS_NUMBER,
    to: "+541168559623",
}

export const sendSMS = async (req, res) => {
    try {
        console.log("Enviando SMS using Twilio account.");
        console.log(twilioClient);
        const result = await twilioClient.messages.create(twilioSMSOptions);
        req.logger.info("Mensaje enviado con éxito.");
        res.send({ message: "Success!", payload: result });
    } catch (error) {
        req.logger.error("Hubo un problema enviando el mensaje.", error);
        res.status(500).send({ error: error });
    }
}