import { ticketModel } from "../dao/models/ticket.model.js";

class TicketService {
    async createTicket(data) {
        if (!data.code || !data.purchase_datetime || !data.amount || !data.purchaser) {
            throw new Error("Datos incompletos.");
        }
        const ticket = new ticketModel(data);
        await ticket.save();
        return ticket;
    }
}

export default TicketService;
