import type { SPFI } from '@pnp/sp';

export type MyProps = {
  sp: SPFI;
  listName: string;
  isDarkTheme: boolean;
  hasTeamsContext: boolean;
}
