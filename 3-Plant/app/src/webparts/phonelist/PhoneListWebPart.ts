import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneToggle
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { MSGraphClientV3 } from '@microsoft/sp-http';

import * as strings from 'Localization';
import { PhoneList } from '../../components';
import type { BaseWebPartProps, PhoneListProps } from '../../models';

export default class PhoneListWebPart extends BaseClientSideWebPart<BaseWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _graphClient!: MSGraphClientV3;

  public render(): void {
    const element: React.ReactElement<PhoneListProps> = React.createElement(
      PhoneList,
      {
        webPartProps: this.properties,
        graphClient: this._graphClient,
        isDarkTheme: this._isDarkTheme,
      }
    );
    ReactDom.render(element, this.domElement);
  }

  protected onInit(): Promise<void> {
    return this.context.msGraphClientFactory
      .getClient('3')
      .then((client: MSGraphClientV3) => {
        this._graphClient = client;
      });
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
                })
              ]
            },
            {
              groupName: strings.ColumnsGroupName,
              groupFields: [
                PropertyPaneToggle('showDepartment', {
                  label: strings.ShowDepartment
                }),
                PropertyPaneToggle('showJobTitle', {
                  label: strings.ShowJobTitle
                }),
                PropertyPaneToggle('showEmail', {
                  label: strings.ShowEmail
                }),
                PropertyPaneToggle('showMobilePhone', {
                  label: strings.ShowMobilePhone
                }),
                PropertyPaneToggle('showBusinessPhone', {
                  label: strings.ShowBusinessPhone
                })
              ]
            },
            {
              groupName: strings.FiltersGroupName,
              groupFields: [
                PropertyPaneToggle('allowFirstLetterFilter', {
                  label: strings.AllowFirstLetterFilter
                }),
                PropertyPaneToggle('allowDepartmentFilter', {
                  label: strings.AllowDepartmentFilter
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
