import { generateMockProduct } from "./utils.mock.js";

export const getMockProducts = async (req, res) => {
    try {
        let products = [];
        for (let i = 0; i <= 100; i++) {
            products.push(generateMockProduct());
        }
        res.send({status: "success", payload: products});
    } catch (error) {
        console.error(error);
        res.status(500).send({error:  error, message: "No se pudieron obtener los productos."});
    }
};