import type { BaseListItem } from './BaseListItem';

export type Deployment = BaseListItem & {
  AssetId: number;
  AssetTitle?: string;
  DeployedTo: string;
  Department: string;
  DeployedDate: string;
  ReturnDate: string | null;
  Notes: string;
};
