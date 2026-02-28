import { useState, useEffect, useCallback, useMemo } from 'react';
import type { SPFI } from '@pnp/sp';
import type { Deployment } from '../models';
import { createDeploymentService } from '../services';
import { deploymentCache } from '../cache';

type UseDeploymentsReturn = {
  deployments: Deployment[];
  loading: boolean;
  error: string | undefined;
  refresh: () => void;
  addDeployment: (deployment: Omit<Deployment, 'Id' | 'AssetTitle' | 'Created' | 'Modified'>) => Promise<void>;
  updateDeployment: (id: number, deployment: Partial<Deployment>) => Promise<void>;
  deleteDeployment: (id: number) => Promise<void>;
};

export const useDeployments = (sp: SPFI, listName: string, department: string): UseDeploymentsReturn => {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const service = useMemo(() => createDeploymentService(sp, listName), [sp, listName]);

  const fetchDeployments = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(undefined);

    try {
      const cached = await deploymentCache.getAll(department);
      if (cached.length > 0) {
        setDeployments(cached);
        setLoading(false);
      }

      const fresh = await service.getAll(department);
      await deploymentCache.putAll(fresh);
      setDeployments(fresh);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [service, department, refreshKey]);

  useEffect(() => {
    fetchDeployments().catch((): undefined => undefined);
  }, [fetchDeployments]);

  const refresh = useCallback((): void => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const addDeployment = useCallback(async (deployment: Omit<Deployment, 'Id' | 'AssetTitle' | 'Created' | 'Modified'>): Promise<void> => {
    const created = await service.add(deployment);
    await deploymentCache.put(created);
    setRefreshKey((prev) => prev + 1);
  }, [service]);

  const updateDeployment = useCallback(async (id: number, deployment: Partial<Deployment>): Promise<void> => {
    await service.update(id, deployment);
    setRefreshKey((prev) => prev + 1);
  }, [service]);

  const deleteDeployment = useCallback(async (id: number): Promise<void> => {
    await service.remove(id);
    await deploymentCache.remove(id);
    setDeployments((prev) => prev.filter((d) => d.Id !== id));
  }, [service]);

  return { deployments, loading, error, refresh, addDeployment, updateDeployment, deleteDeployment };
};
