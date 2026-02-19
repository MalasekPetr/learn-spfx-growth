import Dexie, { type Table } from 'dexie';
import type { Ticket } from '../models';

class TicketDatabase extends Dexie {
  tickets!: Table<Ticket, number>;

  constructor() {
    super('HelpdeskTicketsDB');
    this.version(1).stores({
      tickets: 'Id, Title, Status, Priority, Category, AssignedTo'
    });
  }
}

const db = new TicketDatabase();

export const ticketCache = {
  async getAll(): Promise<Ticket[]> {
    return db.tickets.toArray();
  },

  async putAll(tickets: Ticket[]): Promise<void> {
    await db.tickets.clear();
    await db.tickets.bulkPut(tickets);
  },

  async put(ticket: Ticket): Promise<void> {
    await db.tickets.put(ticket);
  },

  async remove(id: number): Promise<void> {
    await db.tickets.delete(id);
  },

  async clear(): Promise<void> {
    await db.tickets.clear();
  }
};
