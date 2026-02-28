import { useState, useEffect, useCallback } from 'react';
import type { MSGraphClientV3 } from '@microsoft/sp-http';
import type { BreadcrumbItem, DriveItem, DriveItemResponse } from '../models';
import { useBreadcrumb } from './useBreadcrumb';

export type UseOneDriveReturn = {
  items: DriveItem[];
  loading: boolean;
  error: string | undefined;
  breadcrumb: BreadcrumbItem[];
  navigateToFolder: (folderId: string, folderName: string) => void;
  navigateToBreadcrumb: (index: number) => void;
  refresh: () => void;
};

export const useOneDrive = (graphClient: MSGraphClientV3): UseOneDriveReturn => {
  const { breadcrumb, currentFolderId, navigateToFolder, navigateToBreadcrumb } =
    useBreadcrumb({ id: 'root', name: 'OneDrive' });

  const [items, setItems] = useState<DriveItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);

  const fetchItems = useCallback(async (folderId: string): Promise<void> => {
    setLoading(true);
    setError(undefined);
    try {
      const endpoint: string = folderId === 'root'
        ? '/me/drive/root/children'
        : `/me/drive/items/${folderId}/children`;

      const response: DriveItemResponse = await graphClient
        .api(endpoint)
        .select('id,name,size,lastModifiedDateTime,webUrl,folder,file')
        .orderby('name')
        .get();

      setItems(response.value);
    } catch (err: unknown) {
      const message: string = err instanceof Error ? err.message : String(err);
      setError(message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [graphClient]);

  useEffect(() => {
    fetchItems(currentFolderId)
    .catch((): undefined => undefined);
  }, [currentFolderId, fetchItems]);

  const refresh = useCallback((): void => {
    fetchItems(currentFolderId)
    .catch((): undefined => undefined);
  }, [currentFolderId, fetchItems]);

  return { items, loading, error, breadcrumb, navigateToFolder, navigateToBreadcrumb, refresh };
};
