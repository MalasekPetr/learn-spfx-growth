import type { SPFI } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import type { Ticket } from '../models';

const SELECT_FIELDS = ['Id', 'Title', 'Description', 'Status', 'Priority', 'Category', 'AssignedTo', 'Created', 'Modified'];

export const createTicketService = (sp: SPFI, listName: string) => ({

  async getAll(): Promise<Ticket[]> {
    const items = await sp.web.lists
      .getByTitle(listName)
      .items
      .select(...SELECT_FIELDS)
      .orderBy('Id', false)
      .top(500)();
    return items as Ticket[];
  },

  async add(ticket: Omit<Ticket, 'Id' | 'Created' | 'Modified'>): Promise<Ticket> {
    const result = await sp.web.lists
      .getByTitle(listName)
      .items
      .add(ticket);
    return result as Ticket;
  },

  async update(id: number, ticket: Partial<Ticket>): Promise<void> {
    await sp.web.lists
      .getByTitle(listName)
      .items
      .getById(id)
      .update(ticket);
  },

  async remove(id: number): Promise<void> {
    await sp.web.lists
      .getByTitle(listName)
      .items
      .getById(id)
      .delete();
  }
});
