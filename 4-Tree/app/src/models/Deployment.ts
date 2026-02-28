export type Deployment = {
  Id: number;
  Title: string;
  AssetId: number;
  AssetTitle?: string;
  DeployedTo: string;
  Department: string;
  DeployedDate: string;
  ReturnDate: string | null;
  Notes: string;
  Created?: string;
  Modified?: string;
};
