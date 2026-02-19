declare interface ILocalization {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  ColumnsGroupName: string;
  DescriptionFieldLabel: string;
  SearchPlaceholder: string;
  RefreshButton: string;
  ColumnDisplayName: string;
  ColumnDepartment: string;
  ColumnJobTitle: string;
  ColumnEmail: string;
  ColumnMobilePhone: string;
  ColumnBusinessPhone: string;
  LoadingMessage: string;
  ErrorPrefix: string;
  NoResultsMessage: string;
  ShowDepartment: string;
  ShowJobTitle: string;
  ShowEmail: string;
  ShowMobilePhone: string;
  ShowBusinessPhone: string;
}

declare module 'Localization' {
  const strings: ILocalization;
  export = strings;
}
