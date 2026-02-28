import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { spfi, SPFx } from '@pnp/sp';
import type { SPFI } from '@pnp/sp';
import '@pnp/sp/profiles';

import * as strings from 'Localization';
import { AssetDeployment } from '../../components';
import type { AssetDeploymentProps, BaseWebPartProps } from '../../models';

export default class AssetDeploymentWebPart extends BaseClientSideWebPart<BaseWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _sp!: SPFI;
  private _userDepartment: string = '';

  public render(): void {
    const element: React.ReactElement<AssetDeploymentProps> = React.createElement(
      AssetDeployment,
      {
        webPartProps: this.properties,
        sp: this._sp,
        userDepartment: this._userDepartment,
        isDarkTheme: this._isDarkTheme,
        hasTeamsContext: !!this.context.sdks.microsoftTeams
      }
    );
    ReactDom.render(element, this.domElement);
  }

  protected async onInit(): Promise<void> {
    this._sp = spfi().using(SPFx(this.context));

    try {
      const profile = await this._sp.profiles.myProperties();
      const props = profile.UserProfileProperties as Array<{ Key: string; Value: string }>;
      this._userDepartment = props.find((p) => p.Key === 'Department')?.Value || '';
    } catch {
      this._userDepartment = '';
    }
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const { semanticColors } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                }),
                PropertyPaneTextField('assetsListName', {
                  label: strings.AssetsListNameLabel
                }),
                PropertyPaneTextField('deploymentsListName', {
                  label: strings.DeploymentsListNameLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
