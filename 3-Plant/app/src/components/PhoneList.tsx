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
  MessageBarType,
  Dropdown,
  type IDropdownOption
} from '@fluentui/react';
import * as strings from 'Localization';
import type { PhoneListProps, User } from '../models';
import { useUsers, useDebounce } from '../hooks';
import { getFirstLetter, generateCzechAlphabet } from '../utils';
import styles from '../styles/App.module.scss';

export function PhoneList(props: PhoneListProps): JSX.Element {
  const {
    graphClient,
    isDarkTheme,
    webPartProps: {
      showDepartment, showJobTitle, showEmail, showMobilePhone, showBusinessPhone,
      allowFirstLetterFilter, allowDepartmentFilter
    }
  } = props;

  const [searchText, setSearchText] = React.useState<string>('');
  const [firstLetterFilter, setFirstLetterFilter] = React.useState<string>('');
  const [departmentFilter, setDepartmentFilter] = React.useState<string>('');

  const debouncedSearch = useDebounce(searchText, 300);
  const { users, allUsers, loading, error, refresh } = useUsers(graphClient, debouncedSearch);

  const alphabet = React.useMemo(
    () => allowFirstLetterFilter ? generateCzechAlphabet() : [],
    [allowFirstLetterFilter]
  );

  const availableLetters = React.useMemo(() => {
    const letters = new Set<string>();
    allUsers.forEach((u) => {
      const letter = getFirstLetter(u.surname || '');
      if (letter) letters.add(letter);
    });
    return letters;
  }, [allUsers]);

  const departmentOptions = React.useMemo((): IDropdownOption[] => {
    const departments = [...new Set(
      allUsers.map((u) => u.department).filter((d): d is string => !!d)
    )].sort((a, b) => a.localeCompare(b, 'cs'));

    return [
      { key: '', text: strings.AllDepartments },
      ...departments.map((d) => ({ key: d, text: d }))
    ];
  }, [allUsers]);

  const filteredUsers = React.useMemo(() => {
    return users.filter((u) => {
      if (departmentFilter && u.department !== departmentFilter) return false;
      if (firstLetterFilter && getFirstLetter(u.surname || '') !== firstLetterFilter) return false;
      return true;
    });
  }, [users, departmentFilter, firstLetterFilter]);

  const hasActiveFilters = firstLetterFilter !== '' || departmentFilter !== '';

  const clearFilters = React.useCallback((): void => {
    setFirstLetterFilter('');
    setDepartmentFilter('');
  }, []);

  const onLetterClick = React.useCallback((letter: string): void => {
    setFirstLetterFilter((prev) => prev === letter ? '' : letter);
  }, []);

  const commandBarItems: ICommandBarItemProps[] = React.useMemo(() => {
    const items: ICommandBarItemProps[] = [
      {
        key: 'refresh',
        text: strings.RefreshButton,
        iconProps: { iconName: 'Refresh' },
        onClick: refresh
      }
    ];
    if (hasActiveFilters) {
      items.push({
        key: 'clearFilters',
        text: strings.ClearFilters,
        iconProps: { iconName: 'ClearFilter' },
        onClick: clearFilters
      });
    }
    return items;
  }, [refresh, hasActiveFilters, clearFilters]);

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
    <section className={`${styles.app} ${isDarkTheme ? styles.dark : ''}`}>
      <CommandBar items={commandBarItems} />
      <div className={styles.searchBox}>
        <SearchBox
          placeholder={strings.SearchPlaceholder}
          value={searchText}
          onChange={(_, newValue) => setSearchText(newValue || '')}
        />
      </div>
      {allowFirstLetterFilter && alphabet.length > 0 && (
        <div className={styles.letterBar}>
          {alphabet.map((letter) => {
            const isActive = firstLetterFilter === letter;
            const isAvailable = availableLetters.has(letter);
            const className = isActive
              ? styles.letterButtonActive
              : isAvailable
                ? styles.letterButton
                : styles.letterButtonDisabled;
            return (
              <button
                type="button"
                key={letter}
                className={className}
                onClick={() => isAvailable || isActive ? onLetterClick(letter) : undefined}
                title={letter}
              >
                {letter}
              </button>
            );
          })}
        </div>
      )}
      {allowDepartmentFilter && (
        <div className={styles.filterBar}>
          <Dropdown
            selectedKey={departmentFilter}
            options={departmentOptions}
            onChange={(_, option) => setDepartmentFilter((option?.key as string) || '')}
            styles={{ root: { minWidth: 250 } }}
          />
        </div>
      )}
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
            items={filteredUsers}
            columns={columns}
            selectionMode={SelectionMode.none}
            layoutMode={DetailsListLayoutMode.justified}
          />
        )}
        {!loading && !error && filteredUsers.length === 0 && (
          <MessageBar messageBarType={MessageBarType.info}>
            {strings.NoResultsMessage}
          </MessageBar>
        )}
      </Stack>
    </section>
  );
}
