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

    async removeOldSolvedMessages(req, res) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setHours(cutoffDate.getHours() - 48);

            const messagesToDelete = await messageModel.find({
                status: 'solved',
                date: { $lt: cutoffDate }
            });

            if (messagesToDelete.length === 0) {
                return res.status(200).json({
                    success: true,
                    message: "No hay mensajes resueltos con más de 48 horas."
                });
            }

            const result = await messageModel.deleteMany({
                status: 'solved',
                date: { $lt: cutoffDate }
            });

            res.status(200).json({
                success: true,
                message: `Se eliminaron ${result.deletedCount} mensajes.`
            });
        } catch (error) {
            console.error("Error eliminando mensajes:", error);
            res.status(500).json({ success: false, message: "Error interno del servidor." });
        }
    }
}

export default MessageController;
