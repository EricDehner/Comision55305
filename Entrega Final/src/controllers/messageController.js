import { messageModel } from "../dao/models/message.model.js";

class MessageController {
    async changeStatus(req, res) {
        try {
            const messageId = req.params.mid;
            const { status } = req.body;

            const message = await messageModel.findById(messageId);

            if (!message) {
                return res.status(404).json({ success: false, message: "Mensaje no encontrado." });
            }

            message.status = status;
            await message.save();

            res.status(200).json({ success: true, message: "Estado del mensaje actualizado con éxito." });
        } catch (error) {
            console.error("Error actualizando estado del mensaje:", error);
            res.status(500).json({ success: false, message: "Error interno del servidor." });
        }
    }
}

export default MessageController;
