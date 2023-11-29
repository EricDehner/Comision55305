import TicketService from "../services/ticketService.js";

class TicketController {
    constructor() {
        this.ticketService = new TicketService();
    }

    async createTicket(req) {
        try {
            const data = req.body;
            const ticket = await this.ticketService.createTicket(data);

            if (ticket) {
                //req.logger.info("Ticket creado con éxito.");
                return ticket;
            } else {
                //req.logger.error("Error al crear ticket.");
                throw new Error("Error al crear el ticket");
            }
        } catch (error) {
            // req.logger.error('Error en ticket:', error);
            console.log(error);
            throw new Error(error);
        }
    } 
}

export default new TicketController();