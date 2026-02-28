import { useState, useEffect } from 'react';
import type { SPFI } from '@pnp/sp';
import '@pnp/sp/profiles';
import type { UserInfo } from '../models';

type UseCurrentUserReturn = {
  userInfo: UserInfo | undefined;
  loading: boolean;
  error: string | undefined;
};

export const useCurrentUser = (sp: SPFI): UseCurrentUserReturn => {
  const [userInfo, setUserInfo] = useState<UserInfo | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchUser = async (): Promise<void> => {
      try {
        const profile = await sp.profiles.myProperties();
        const props = profile.UserProfileProperties as Array<{ Key: string; Value: string }>;
        const dept = props.find((p) => p.Key === 'Department')?.Value || '';
        setUserInfo({
          displayName: profile.DisplayName || '',
          department: dept,
          email: profile.Email || '',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };
    fetchUser().catch((): undefined => undefined);
  }, [sp]);

  return { userInfo, loading, error };
};
