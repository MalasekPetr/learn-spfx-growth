import * as React from 'react';
import {
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  type IColumn,
  Breadcrumb,
  type IBreadcrumbItem,
  CommandBar,
  type ICommandBarItemProps,
  Spinner,
  SpinnerSize,
  Stack,
  MessageBar,
  MessageBarType,
  Icon
} from '@fluentui/react';
import * as strings from 'Localization';
import type { OneDriveExplorerProps, DriveItem } from '../models';
import { useOneDrive } from '../hooks';
import styles from '../styles/App.module.scss';

export function OneDriveExplorer(props: OneDriveExplorerProps): JSX.Element {
  const { graphClient, isDarkTheme } = props;
  const { items, loading, error, breadcrumb, navigateToFolder, navigateToBreadcrumb, refresh } = useOneDrive(graphClient);

  const breadcrumbItems: IBreadcrumbItem[] = breadcrumb.map((item, index) => ({
    text: item.name,
    key: item.id,
    onClick: index < breadcrumb.length - 1
      ? () => navigateToBreadcrumb(index)
      : undefined,
    isCurrentItem: index === breadcrumb.length - 1
  }));

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'refresh',
      text: strings.RefreshButton,
      iconProps: { iconName: 'Refresh' },
      onClick: refresh
    }
  ];

  const onItemInvoked = React.useCallback((item: DriveItem): void => {
    if (item.folder) {
      navigateToFolder(item.id, item.name);
    } else {
      window.open(item.webUrl, '_blank', 'noopener,noreferrer');
    }
  }, [navigateToFolder]);

  const columns: IColumn[] = [
    {
      key: 'icon',
      name: '',
      minWidth: 20,
      maxWidth: 20,
      onRender: (item: DriveItem) => (
        <Icon iconName={item.folder ? 'FabricFolder' : 'Page'} />
      )
    },
    {
      key: 'name',
      name: strings.ColumnName,
      fieldName: 'name',
      minWidth: 200,
      maxWidth: 400,
      isResizable: true,
      onRender: (item: DriveItem) => (
        <span className={item.folder ? styles.folderName : undefined}>
          {item.name}
        </span>
      )
    },
    {
      key: 'lastModifiedDateTime',
      name: strings.ColumnModified,
      fieldName: 'lastModifiedDateTime',
      minWidth: 150,
      maxWidth: 200,
      isResizable: true,
      onRender: (item: DriveItem) => (
        <span>{new Date(item.lastModifiedDateTime).toLocaleString()}</span>
      )
    },
    {
      key: 'size',
      name: strings.ColumnSize,
      fieldName: 'size',
      minWidth: 80,
      maxWidth: 120,
      isResizable: true,
      onRender: (item: DriveItem) => (
        <span>{item.folder ? '' : formatFileSize(item.size)}</span>
      )
    }
  ];

  return (
    <section className={`${styles.app} ${isDarkTheme ? styles.dark : ''}`}>
      <CommandBar items={commandBarItems} />
      <Breadcrumb items={breadcrumbItems} />
      <Stack tokens={{ childrenGap: 8 }}>
        {error && (
          <MessageBar messageBarType={MessageBarType.error} isMultiline={false}>
            {strings.ErrorPrefix}{error}
          </MessageBar>
        )}
        {loading ? (
          <Spinner size={SpinnerSize.large} label={strings.LoadingMessage} />
        ) : (
          <DetailsList
            items={items}
            columns={columns}
            selectionMode={SelectionMode.none}
            layoutMode={DetailsListLayoutMode.justified}
            onItemInvoked={onItemInvoked}
          />
        )}
        {!loading && !error && items.length === 0 && (
          <MessageBar messageBarType={MessageBarType.info}>
            {strings.EmptyFolderMessage}
          </MessageBar>
        )}
      </Stack>
    </section>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units: string[] = ['B', 'KB', 'MB', 'GB'];
  const i: number = Math.floor(Math.log(bytes) / Math.log(1024));
  const size: number = bytes / Math.pow(1024, i);
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
