import { useState, useEffect, useCallback } from 'react';
import type { MSGraphClientV3 } from '@microsoft/sp-http';
import type { DriveItem, DriveItemResponse } from '../models';

export type BreadcrumbItem = {
  id: string;
  name: string;
};

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
  const [items, setItems] = useState<DriveItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([
    { id: 'root', name: 'OneDrive' }
  ]);

  const currentFolderId: string = breadcrumb[breadcrumb.length - 1].id;

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
    void fetchItems(currentFolderId);
  }, [currentFolderId, fetchItems]);

  const navigateToFolder = useCallback((folderId: string, folderName: string): void => {
    setBreadcrumb(prev => [...prev, { id: folderId, name: folderName }]);
  }, []);

  const navigateToBreadcrumb = useCallback((index: number): void => {
    setBreadcrumb(prev => prev.slice(0, index + 1));
  }, []);

  const refresh = useCallback((): void => {
    void fetchItems(currentFolderId);
  }, [currentFolderId, fetchItems]);

  return { items, loading, error, breadcrumb, navigateToFolder, navigateToBreadcrumb, refresh };
};
