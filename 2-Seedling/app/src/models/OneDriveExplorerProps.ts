import type { MSGraphClientV3 } from '@microsoft/sp-http';
import type { BaseWebPartProps } from './BaseWebPartProps';

export type OneDriveExplorerProps = {
  webPartProps: BaseWebPartProps;
  graphClient: MSGraphClientV3;
  isDarkTheme: boolean;
}
