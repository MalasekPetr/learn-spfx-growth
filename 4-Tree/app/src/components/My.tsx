import * as React from 'react';
import {
  Grid,
  GridColumn,
  type GridSortChangeEvent
} from '@progress/kendo-react-grid';
import { orderBy, type SortDescriptor } from '@progress/kendo-data-query';
import {
  SearchBox,
  CommandBar,
  type ICommandBarItemProps,
  Spinner,
  SpinnerSize,
  Stack,
  MessageBar,
  MessageBarType,
  IconButton,
  Dialog,
  DialogType,
  DialogFooter,
  PrimaryButton,
  DefaultButton
} from '@fluentui/react';
import '@progress/kendo-theme-default/dist/all.css';
import * as strings from 'Localization';
import type { MyProps, Ticket } from '../models';
import { useTickets, useDebounce } from '../hooks';
import { normalizeText } from '../utils';
import { StatusCell } from './StatusCell';
import { PriorityCell } from './PriorityCell';
import { TicketForm } from './TicketForm';
import styles from '../styles/App.module.scss';

export const My: React.FunctionComponent<MyProps> = (props) => {
  const { sp, listName, isDarkTheme, hasTeamsContext } = props;

  const [searchText, setSearchText] = React.useState<string>('');
  const [sort, setSort] = React.useState<SortDescriptor[]>([]);
  const [formOpen, setFormOpen] = React.useState<boolean>(false);
  const [editTicket, setEditTicket] = React.useState<Ticket | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = React.useState<Ticket | undefined>(undefined);

  const debouncedSearch = useDebounce(searchText, 300);
  const { tickets, loading, error, refresh, addTicket, updateTicket, deleteTicket } = useTickets(sp, listName);

  const filteredTickets = React.useMemo(() => {
    if (!debouncedSearch) return tickets;
    const normalized = normalizeText(debouncedSearch);
    return tickets.filter((t) =>
      normalizeText(t.Title || '').includes(normalized) ||
      normalizeText(t.Description || '').includes(normalized) ||
      normalizeText(t.AssignedTo || '').includes(normalized) ||
      normalizeText(t.Category || '').includes(normalized)
    );
  }, [tickets, debouncedSearch]);

  const sortedTickets = React.useMemo(() =>
    sort.length > 0 ? orderBy(filteredTickets, sort) : filteredTickets
  , [filteredTickets, sort]);

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'newTicket',
      text: strings.NewTicketButton,
      iconProps: { iconName: 'Add' },
      onClick: () => { setEditTicket(undefined); setFormOpen(true); }
    },
    {
      key: 'refresh',
      text: strings.RefreshButton,
      iconProps: { iconName: 'Refresh' },
      onClick: refresh
    }
  ];

  const handleSave = React.useCallback(async (data: Omit<Ticket, 'Id' | 'Created' | 'Modified'>): Promise<void> => {
    if (editTicket) {
      await updateTicket(editTicket.Id, data);
    } else {
      await addTicket(data);
    }
  }, [editTicket, addTicket, updateTicket]);

  const handleEdit = React.useCallback((ticket: Ticket): void => {
    setEditTicket(ticket);
    setFormOpen(true);
  }, []);

  const handleDeleteConfirm = React.useCallback(async (): Promise<void> => {
    if (deleteTarget) {
      await deleteTicket(deleteTarget.Id);
      setDeleteTarget(undefined);
    }
  }, [deleteTarget, deleteTicket]);

  const CommandCell = React.useCallback((cellProps: { dataItem: Ticket }) => (
    <td>
      <IconButton iconProps={{ iconName: 'Edit' }} title={strings.EditButton} onClick={() => handleEdit(cellProps.dataItem)} />
      <IconButton iconProps={{ iconName: 'Delete' }} title={strings.DeleteButton} onClick={() => setDeleteTarget(cellProps.dataItem)} />
    </td>
  ), [handleEdit]);

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
          <Grid
            data={sortedTickets}
            sortable={true}
            sort={sort}
            onSortChange={(e: GridSortChangeEvent) => setSort(e.sort)}
          >
            <GridColumn field="Title" title={strings.ColumnTitle} />
            <GridColumn field="Status" title={strings.ColumnStatus} cell={StatusCell} width="130px" />
            <GridColumn field="Priority" title={strings.ColumnPriority} cell={PriorityCell} width="120px" />
            <GridColumn field="Category" title={strings.ColumnCategory} width="120px" />
            <GridColumn field="AssignedTo" title={strings.ColumnAssignedTo} />
            <GridColumn title={strings.ColumnActions} width="100px" cell={CommandCell} sortable={false} />
          </Grid>
        )}
        {!loading && !error && tickets.length === 0 && (
          <MessageBar messageBarType={MessageBarType.info}>
            {strings.NoResultsMessage}
          </MessageBar>
        )}
      </Stack>

      <TicketForm
        isOpen={formOpen}
        ticket={editTicket}
        onSave={handleSave}
        onDismiss={() => setFormOpen(false)}
      />

      <Dialog
        hidden={!deleteTarget}
        onDismiss={() => setDeleteTarget(undefined)}
        dialogContentProps={{
          type: DialogType.normal,
          title: strings.DeleteConfirmTitle,
          subText: strings.DeleteConfirmMessage
        }}
      >
        <DialogFooter>
          <PrimaryButton onClick={handleDeleteConfirm} text={strings.DeleteButton} />
          <DefaultButton onClick={() => setDeleteTarget(undefined)} text={strings.CancelButton} />
        </DialogFooter>
      </Dialog>
    </section>
  );
};
