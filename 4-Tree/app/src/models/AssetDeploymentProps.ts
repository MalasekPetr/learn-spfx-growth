import type { SPFI } from '@pnp/sp';
import type { BaseWebPartProps } from './BaseWebPartProps';

export type AssetDeploymentProps = {
  webPartProps: BaseWebPartProps;
  sp: SPFI;
  userDepartment: string;
  isDarkTheme: boolean;
  hasTeamsContext: boolean;
};
