import PurchaseService from "../services/purchaseService.js";
import CustomError from "../services/errors/customErrorMsg.js";

class PurchaseController {
    constructor() {
        this.purchaseService = new PurchaseService();
    }

    async getPurchase(req, res, next) {
        try {
            // Lógica para obtener compras
            const purchases = await this.purchaseService.getPurchases();
            return res.status(200).json(purchases);
        } catch (error) {
            console.error("Error obteniendo compras:", error);
            return next(new CustomError({
                name: "Error al obtener compras",
                message: "Hubo un error al obtener las compras.",
                code: 500,
            }));
        }
    }

}

export default new PurchaseController();