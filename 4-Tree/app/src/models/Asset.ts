import type { BaseListItem } from './BaseListItem';

export type Asset = BaseListItem & {
  Description: string;
  Category: string;
  SerialNumber: string;
  Status: string;
};
