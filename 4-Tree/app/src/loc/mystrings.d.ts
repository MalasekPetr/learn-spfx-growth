declare interface ILocalization {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  DescriptionFieldLabel: string;
  ListNameFieldLabel: string;
  SearchPlaceholder: string;
  RefreshButton: string;
  NewTicketButton: string;
  EditButton: string;
  DeleteButton: string;
  SaveButton: string;
  CancelButton: string;
  ColumnTitle: string;
  ColumnStatus: string;
  ColumnPriority: string;
  ColumnCategory: string;
  ColumnAssignedTo: string;
  ColumnActions: string;
  LoadingMessage: string;
  ErrorPrefix: string;
  NoResultsMessage: string;
  NewTicket: string;
  EditTicket: string;
  FieldTitle: string;
  FieldDescription: string;
  FieldStatus: string;
  FieldPriority: string;
  FieldCategory: string;
  FieldAssignedTo: string;
  DeleteConfirmTitle: string;
  DeleteConfirmMessage: string;
}

declare module 'Localization' {
  const strings: ILocalization;
  export = strings;
}
