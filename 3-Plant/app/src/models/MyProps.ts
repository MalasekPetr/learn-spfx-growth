import type { MSGraphClientV3 } from '@microsoft/sp-http';

export type MyProps = {
  graphClient: MSGraphClientV3;
  isDarkTheme: boolean;
  hasTeamsContext: boolean;
  showDepartment: boolean;
  showJobTitle: boolean;
  showEmail: boolean;
  showMobilePhone: boolean;
  showBusinessPhone: boolean;
}
