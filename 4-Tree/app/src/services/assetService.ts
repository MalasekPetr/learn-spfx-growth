import type { SPFI } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import type { Asset } from '../models';

const SELECT_FIELDS = ['Id', 'Title', 'Description', 'Category', 'SerialNumber', 'Status', 'Created', 'Modified'];

export const createAssetService = (sp: SPFI, listName: string) => ({

  async getAll(): Promise<Asset[]> {
    const items = await sp.web.lists
      .getByTitle(listName)
      .items
      .select(...SELECT_FIELDS)
      .orderBy('Title', true)
      .top(500)();
    return items as Asset[];
  },

  async add(asset: Omit<Asset, 'Id' | 'Created' | 'Modified'>): Promise<Asset> {
    const result = await sp.web.lists
      .getByTitle(listName)
      .items
      .add(asset);
    return result as Asset;
  },

  async update(id: number, asset: Partial<Asset>): Promise<void> {
    const { Id: _id, Created: _c, Modified: _m, ...fields } = asset as Asset;
    await sp.web.lists
      .getByTitle(listName)
      .items
      .getById(id)
      .update(fields);
  },

  async remove(id: number): Promise<void> {
    await sp.web.lists
      .getByTitle(listName)
      .items
      .getById(id)
      .delete();
  }
});
