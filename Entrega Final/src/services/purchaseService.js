import PurchaseManager from "../dao/PurchaseManager.js";

class PurchaseService {
  constructor() {
    this.purchaseManager = new PurchaseManager();
  }

  async getPurchases() {
    try {
      const purchases = await this.purchaseManager.getAllPurchases();
      return purchases;
    } catch (error) {
      console.error("Error en el servicio de compras:", error);
      throw new Error("Internal Server Error");
    }
  }
}

export default PurchaseService;