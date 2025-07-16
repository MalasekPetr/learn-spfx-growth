import * as React from 'react';
import * as ReactDom from 'react-dom';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { My } from '../../components';
import { MyProps } from '../../models';

export interface IMyWebPartProps {
}

export default class MyWebPart extends BaseClientSideWebPart<IMyWebPartProps> {

  public render(): void {
    const element: React.ReactElement<MyProps> = React.createElement(
      My,
      {
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }
}
