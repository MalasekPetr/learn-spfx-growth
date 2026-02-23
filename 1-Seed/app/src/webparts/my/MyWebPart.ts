import * as React from 'react';
import * as ReactDom from 'react-dom';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
<<<<<<< HEAD:1-Seed/app/src/webparts/my/MyWebPart.ts
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'Localization';
=======
>>>>>>> 07b5ff223c222af6ca796d2c3c11b7c39c12ac63:app/src/webparts/my/MyWebPart.ts
import { My } from '../../components';
import { MyProps, MyWebPartProps } from '../../models';

<<<<<<< HEAD:1-Seed/app/src/webparts/my/MyWebPart.ts
export default class MyWebPart extends BaseClientSideWebPart<MyWebPartProps> {
=======
export interface IMyWebPartProps {
}

export default class MyWebPart extends BaseClientSideWebPart<IMyWebPartProps> {
>>>>>>> 07b5ff223c222af6ca796d2c3c11b7c39c12ac63:app/src/webparts/my/MyWebPart.ts

  public render(): void {
    const element: React.ReactElement<MyProps> = React.createElement(
      My,
      {
      }
    );
    ReactDom.render(element, this.domElement);
  }

<<<<<<< HEAD:1-Seed/app/src/webparts/my/MyWebPart.ts
  protected onInit(): Promise<void> {
    return this._getEnvironmentMessage().then(message => {
      this._environmentMessage = message;
    });
  }

  private _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) { // running in Teams, office.com or Outlook
      return this.context.sdks.microsoftTeams.teamsJs.app.getContext()
        .then(context => {
          let environmentMessage: string = '';
          switch (context.app.host.name) {
            case 'Office': // running in Office
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOffice : strings.AppOfficeEnvironment;
              break;
            case 'Outlook': // running in Outlook
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOutlook : strings.AppOutlookEnvironment;
              break;
            case 'Teams': // running in Teams
            case 'TeamsModern':
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
              break;
            default:
              environmentMessage = strings.UnknownEnvironment;
          }

          return environmentMessage;
        });
    }

    return Promise.resolve(this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment);
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const {
      semanticColors
    } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }
  }

=======
>>>>>>> 07b5ff223c222af6ca796d2c3c11b7c39c12ac63:app/src/webparts/my/MyWebPart.ts
  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }
}
