import type { SPFI } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import type { Deployment } from '../models';

const SELECT_FIELDS = [
  'Id', 'Title', 'AssetId', 'Asset/Title',
  'DeployedTo', 'Department', 'DeployedDate', 'ReturnDate',
  'Notes', 'Created', 'Modified'
];
const EXPAND_FIELDS = ['Asset'];

export const createDeploymentService = (sp: SPFI, listName: string) => ({

  async getAll(departmentFilter?: string): Promise<Deployment[]> {
    let query = sp.web.lists
      .getByTitle(listName)
      .items
      .select(...SELECT_FIELDS)
      .expand(...EXPAND_FIELDS)
      .orderBy('Id', false)
      .top(500);

    if (departmentFilter) {
      query = query.filter(`Department eq '${departmentFilter}'`);
    }

    const items = await query();

    return items.map((item: Record<string, unknown>) => ({
      Id: item.Id as number,
      Title: item.Title as string,
      AssetId: item.AssetId as number,
      AssetTitle: (item.Asset as { Title: string } | null)?.Title || '',
      DeployedTo: (item.DeployedTo as string) || '',
      Department: (item.Department as string) || '',
      DeployedDate: (item.DeployedDate as string) || '',
      ReturnDate: (item.ReturnDate as string) || null,
      Notes: (item.Notes as string) || '',
      Created: item.Created as string,
      Modified: item.Modified as string,
    }));
  },

  async add(deployment: Omit<Deployment, 'Id' | 'AssetTitle' | 'Created' | 'Modified'>): Promise<Deployment> {
    const result = await sp.web.lists
      .getByTitle(listName)
      .items
      .add({
        Title: deployment.Title,
        AssetId: deployment.AssetId,
        DeployedTo: deployment.DeployedTo,
        Department: deployment.Department,
        DeployedDate: deployment.DeployedDate,
        ReturnDate: deployment.ReturnDate,
        Notes: deployment.Notes,
      });
    return result as Deployment;
  },

  async update(id: number, deployment: Partial<Deployment>): Promise<void> {
    const { Id: _id, AssetTitle: _at, Created: _c, Modified: _m, ...fields } = deployment as Deployment;
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
