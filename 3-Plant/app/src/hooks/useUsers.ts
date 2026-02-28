import { useState, useEffect, useCallback } from 'react';
import type { MSGraphClientV3 } from '@microsoft/sp-http';
import type { User } from '../models';
import { normalizeText } from '../utils';

type UseUsersReturn = {
  users: User[];
  loading: boolean;
  error: string | undefined;
  refresh: () => void;
};

type GraphResponse<T> = {
  value: T[];
  '@odata.nextLink'?: string;
};

const SELECT_FIELDS = 'displayName,givenName,surname,department,jobTitle,companyName,mail,mobilePhone,businessPhones,userPrincipalName';

export const useUsers = (graphClient: MSGraphClientV3, searchText: string): UseUsersReturn => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const fetchAllUsers = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(undefined);

    try {
      const collected: User[] = [];
      let nextLink: string | undefined = undefined;

      const response: GraphResponse<User> = await graphClient
        .api('/users')
        .select(SELECT_FIELDS)
        .top(100)
        .get();

      collected.push(...response.value);
      nextLink = response['@odata.nextLink'];

      while (nextLink) {
        const nextResponse: GraphResponse<User> = await graphClient
          .api(nextLink)
          .get();

        collected.push(...nextResponse.value);
        nextLink = nextResponse['@odata.nextLink'];
      }

      setAllUsers(collected);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [graphClient, refreshKey]);

  useEffect(() => {
    fetchAllUsers().catch(() => { /* handled in state */ });
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

  return { users: filteredUsers, loading, error, refresh };
};
