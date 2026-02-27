import * as React from 'react';
import * as ReactDom from 'react-dom';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { MSGraphClientV3 } from '@microsoft/sp-http';

import { OneDriveExplorer } from '../../components';
import type { OneDriveExplorerProps, BaseWebPartProps } from '../../models';

export default class OneDriveExplorerWebPart extends BaseClientSideWebPart<BaseWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _graphClient!: MSGraphClientV3;

  public render(): void {
    const element: React.ReactElement<OneDriveExplorerProps> = React.createElement(
      OneDriveExplorer,
      {
        graphClient: this._graphClient,
        isDarkTheme: this._isDarkTheme,
        webPartProps: this.properties,}
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
}
