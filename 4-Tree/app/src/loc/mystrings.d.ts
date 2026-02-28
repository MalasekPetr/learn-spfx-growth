declare interface ILocalization {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  DescriptionFieldLabel: string;
  AssetsListNameLabel: string;
  DeploymentsListNameLabel: string;
  AssetsTab: string;
  DeploymentsTab: string;
  RefreshButton: string;
  EditButton: string;
  DeleteButton: string;
  SaveButton: string;
  CancelButton: string;
  SearchPlaceholder: string;
  NewAssetButton: string;
  NewAsset: string;
  EditAsset: string;
  ColumnAssetTitle: string;
  ColumnCategory: string;
  ColumnSerialNumber: string;
  ColumnAssetStatus: string;
  ColumnActions: string;
  FieldAssetTitle: string;
  FieldDescription: string;
  FieldCategory: string;
  FieldSerialNumber: string;
  FieldAssetStatus: string;
  DeleteAssetTitle: string;
  DeleteAssetMessage: string;
  NewDeploymentButton: string;
  NewDeployment: string;
  EditDeployment: string;
  ColumnDeploymentTitle: string;
  ColumnAsset: string;
  ColumnDeployedTo: string;
  ColumnDepartment: string;
  ColumnDeployedDate: string;
  ColumnReturnDate: string;
  FieldDeploymentTitle: string;
  FieldAsset: string;
  FieldDeployedTo: string;
  FieldDepartment: string;
  FieldDeployedDate: string;
  FieldReturnDate: string;
  FieldNotes: string;
  DeleteDeploymentTitle: string;
  DeleteDeploymentMessage: string;
  LoadingMessage: string;
  LoadingUserMessage: string;
  ErrorPrefix: string;
  UserErrorPrefix: string;
  NoAssetsMessage: string;
  NoDeploymentsMessage: string;
}

declare module 'Localization' {
  const strings: ILocalization;
  export = strings;
}
