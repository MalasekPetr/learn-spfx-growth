import type { MSGraphClientV3 } from '@microsoft/sp-http';
import { BaseWebPartProps } from './BaseWebPartProps';

export type PhoneListProps = {
  webPartProps: BaseWebPartProps;
  isDarkTheme: boolean;
  graphClient: MSGraphClientV3;
}
