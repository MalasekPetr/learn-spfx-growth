import Dexie, { type Table } from 'dexie';
import type { Asset, Deployment } from '../models';

class AppDatabase extends Dexie {
  assets!: Table<Asset, number>;
  deployments!: Table<Deployment, number>;

  constructor() {
    super('AssetDeploymentDB');
    this.version(1).stores({
      assets: 'Id, Title, Category, Status, SerialNumber',
      deployments: 'Id, Title, AssetId, DeployedTo, Department, DeployedDate'
    });
  }
}

const db = new AppDatabase();

export const assetCache = {
  async getAll(): Promise<Asset[]> {
    return db.assets.toArray();
  },
  async putAll(assets: Asset[]): Promise<void> {
    await db.assets.clear();
    await db.assets.bulkPut(assets);
  },
  async put(asset: Asset): Promise<void> {
    await db.assets.put(asset);
  },
  async remove(id: number): Promise<void> {
    await db.assets.delete(id);
  },
  async clear(): Promise<void> {
    await db.assets.clear();
  }
};

export const deploymentCache = {
  async getAll(department?: string): Promise<Deployment[]> {
    if (department) {
      return db.deployments.where('Department').equals(department).toArray();
    }
    return db.deployments.toArray();
  },
  async putAll(deployments: Deployment[]): Promise<void> {
    await db.deployments.clear();
    await db.deployments.bulkPut(deployments);
  },
  async put(deployment: Deployment): Promise<void> {
    await db.deployments.put(deployment);
  },
  async remove(id: number): Promise<void> {
    await db.deployments.delete(id);
  },
  async clear(): Promise<void> {
    await db.deployments.clear();
  }
};
