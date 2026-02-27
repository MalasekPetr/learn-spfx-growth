import { BaseWebPartProps } from "./BaseWebPartProps";

export type AppProps = {
  webPartProps: BaseWebPartProps;
  isDarkTheme: boolean;
  userDisplayName: string;
  environmentMessage: string;
}
