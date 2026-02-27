import { useState, useCallback } from 'react';
import type { BreadcrumbItem } from '../models';

export type UseBreadcrumbReturn = {
  breadcrumb: BreadcrumbItem[];
  currentFolderId: string;
  navigateToFolder: (folderId: string, folderName: string) => void;
  navigateToBreadcrumb: (index: number) => void;
};

export const useBreadcrumb = (rootItem: BreadcrumbItem): UseBreadcrumbReturn => {
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([rootItem]);

  const currentFolderId: string = breadcrumb[breadcrumb.length - 1].id;

  const navigateToFolder = useCallback((folderId: string, folderName: string): void => {
    setBreadcrumb(prev => [...prev, { id: folderId, name: folderName }]);
  }, []);

  const navigateToBreadcrumb = useCallback((index: number): void => {
    setBreadcrumb(prev => prev.slice(0, index + 1));
  }, []);

  return { breadcrumb, currentFolderId, navigateToFolder, navigateToBreadcrumb };
};
