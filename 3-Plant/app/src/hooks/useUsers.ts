import { useState, useEffect, useCallback, useMemo } from 'react';
import type { MSGraphClientV3 } from '@microsoft/sp-http';
import type { User } from '../models';
import { createUserService } from '../services';
import { userCache } from '../cache';
import { normalizeText } from '../utils';

type UseUsersReturn = {
  users: User[];
  allUsers: User[];
  loading: boolean;
  error: string | undefined;
  refresh: () => void;
};

export const useUsers = (graphClient: MSGraphClientV3, searchText: string): UseUsersReturn => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const service = useMemo(() => createUserService(graphClient), [graphClient]);

  const fetchAllUsers = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(undefined);

    try {
      const cached = await userCache.getAll();
      if (cached.length > 0) {
        setAllUsers(cached);
        setLoading(false);
      }

      const fresh = await service.getAll();
      await userCache.putAll(fresh);
      setAllUsers(fresh);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [service, refreshKey]);

  useEffect(() => {
    fetchAllUsers().catch((): undefined => undefined);
  }, [fetchAllUsers]);

  const filteredUsers = searchText
    ? allUsers.filter((user) => {
        const normalized = normalizeText(searchText);
        return (
          normalizeText(user.displayName || '').includes(normalized) ||
          normalizeText(user.department || '').includes(normalized) ||
          normalizeText(user.jobTitle || '').includes(normalized) ||
          normalizeText(user.mail || '').includes(normalized)
        );
      })
    : allUsers;

  const refresh = useCallback((): void => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return { users: filteredUsers, allUsers, loading, error, refresh };
};
