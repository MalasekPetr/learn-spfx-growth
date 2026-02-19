declare interface ILocalization {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  DescriptionFieldLabel: string;
  RefreshButton: string;
  ColumnName: string;
  ColumnModified: string;
  ColumnSize: string;
  LoadingMessage: string;
  ErrorPrefix: string;
  EmptyFolderMessage: string;
}

declare module 'Localization' {
  const strings: ILocalization;
  export = strings;
}
