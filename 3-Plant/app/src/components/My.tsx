import * as React from 'react';
import {
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  type IColumn,
  SearchBox,
  CommandBar,
  type ICommandBarItemProps,
  Spinner,
  SpinnerSize,
  Stack,
  MessageBar,
  MessageBarType
} from '@fluentui/react';
import * as strings from 'Localization';
import type { MyProps, User } from '../models';
import { useUsers, useDebounce } from '../hooks';
import styles from '../styles/App.module.scss';

export const My: React.FunctionComponent<MyProps> = (props) => {
  const {
    graphClient,
    isDarkTheme,
    hasTeamsContext,
    showDepartment,
    showJobTitle,
    showEmail,
    showMobilePhone,
    showBusinessPhone
  } = props;

  const [searchText, setSearchText] = React.useState<string>('');
  const debouncedSearch = useDebounce(searchText, 300);
  const { users, loading, error, refresh } = useUsers(graphClient, debouncedSearch);

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'refresh',
      text: strings.RefreshButton,
      iconProps: { iconName: 'Refresh' },
      onClick: refresh
    }
  ];

  const columns: IColumn[] = React.useMemo(() => {
    const cols: IColumn[] = [
      {
        key: 'displayName',
        name: strings.ColumnDisplayName,
        fieldName: 'displayName',
        minWidth: 150,
        maxWidth: 250,
        isResizable: true
      }
    ];

    if (showDepartment) {
      cols.push({
        key: 'department',
        name: strings.ColumnDepartment,
        fieldName: 'department',
        minWidth: 120,
        maxWidth: 200,
        isResizable: true
      });
    }

    if (showJobTitle) {
      cols.push({
        key: 'jobTitle',
        name: strings.ColumnJobTitle,
        fieldName: 'jobTitle',
        minWidth: 120,
        maxWidth: 200,
        isResizable: true
      });
    }

    if (showEmail) {
      cols.push({
        key: 'mail',
        name: strings.ColumnEmail,
        fieldName: 'mail',
        minWidth: 180,
        maxWidth: 280,
        isResizable: true
      });
    }

    if (showMobilePhone) {
      cols.push({
        key: 'mobilePhone',
        name: strings.ColumnMobilePhone,
        fieldName: 'mobilePhone',
        minWidth: 120,
        maxWidth: 160,
        isResizable: true
      });
    }

    if (showBusinessPhone) {
      cols.push({
        key: 'businessPhones',
        name: strings.ColumnBusinessPhone,
        minWidth: 120,
        maxWidth: 160,
        isResizable: true,
        onRender: (item: User) => (
          <span>{item.businessPhones?.[0] || ''}</span>
        )
      });
    }

    return cols;
  }, [showDepartment, showJobTitle, showEmail, showMobilePhone, showBusinessPhone]);

  return (
    <section className={`${styles.app} ${hasTeamsContext ? styles.teams : ''} ${isDarkTheme ? styles.dark : ''}`}>
      <CommandBar items={commandBarItems} />
      <div className={styles.searchBox}>
        <SearchBox
          placeholder={strings.SearchPlaceholder}
          value={searchText}
          onChange={(_, newValue) => setSearchText(newValue || '')}
        />
      </div>
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
            items={users}
            columns={columns}
            selectionMode={SelectionMode.none}
            layoutMode={DetailsListLayoutMode.justified}
          />
        )}
        {!loading && !error && users.length === 0 && (
          <MessageBar messageBarType={MessageBarType.info}>
            {strings.NoResultsMessage}
          </MessageBar>
        )}
      </Stack>
    </section>
  );
};
