import { ticketModel } from "../dao/models/ticket.model.js";

class PurchaseManager {
    async getAllPurchases() {
        try {
            const purchases = await ticketModel.find();
            return purchases;
        } catch (error) {
            console.error("Error en el manager de compras:", error);
            throw error;
        }
    }
}

export default PurchaseManager;