import { useState, useEffect, useCallback, useMemo } from 'react';
import type { SPFI } from '@pnp/sp';
import type { Asset } from '../models';
import { createAssetService } from '../services';
import { assetCache } from '../cache';

type UseAssetsReturn = {
  assets: Asset[];
  loading: boolean;
  error: string | undefined;
  refresh: () => void;
  addAsset: (asset: Omit<Asset, 'Id' | 'Created' | 'Modified'>) => Promise<void>;
  updateAsset: (id: number, asset: Partial<Asset>) => Promise<void>;
  deleteAsset: (id: number) => Promise<void>;
};

export const useAssets = (sp: SPFI, listName: string): UseAssetsReturn => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const service = useMemo(() => createAssetService(sp, listName), [sp, listName]);

  const fetchAssets = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(undefined);

    try {
      const cached = await assetCache.getAll();
      if (cached.length > 0) {
        setAssets(cached);
        setLoading(false);
      }

      const fresh = await service.getAll();
      await assetCache.putAll(fresh);
      setAssets(fresh);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [service, refreshKey]);

  useEffect(() => {
    fetchAssets().catch((): undefined => undefined);
  }, [fetchAssets]);

  const refresh = useCallback((): void => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const addAsset = useCallback(async (asset: Omit<Asset, 'Id' | 'Created' | 'Modified'>): Promise<void> => {
    const created = await service.add(asset);
    await assetCache.put(created);
    setRefreshKey((prev) => prev + 1);
  }, [service]);

  const updateAsset = useCallback(async (id: number, asset: Partial<Asset>): Promise<void> => {
    await service.update(id, asset);
    setRefreshKey((prev) => prev + 1);
  }, [service]);

  const deleteAsset = useCallback(async (id: number): Promise<void> => {
    await service.remove(id);
    await assetCache.remove(id);
    setAssets((prev) => prev.filter((a) => a.Id !== id));
  }, [service]);

  return { assets, loading, error, refresh, addAsset, updateAsset, deleteAsset };
};
