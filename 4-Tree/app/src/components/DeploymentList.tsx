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
  IconButton,
  Dialog,
  DialogType,
  DialogFooter,
  PrimaryButton,
  DefaultButton
} from '@fluentui/react';
import * as strings from 'Localization';
import type { Asset, Deployment } from '../models';
import { useDebounce } from '../hooks';
import { normalizeText } from '../utils';
import { DeploymentForm } from './DeploymentForm';
import styles from '../styles/App.module.scss';

type DeploymentListProps = {
  deployments: Deployment[];
  assets: Asset[];
  loading: boolean;
  error: string | undefined;
  department: string;
  onRefresh: () => void;
  onAdd: (deployment: Omit<Deployment, 'Id' | 'AssetTitle' | 'Created' | 'Modified'>) => Promise<void>;
  onUpdate: (id: number, deployment: Partial<Deployment>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
};

export const DeploymentList: React.FunctionComponent<DeploymentListProps> = (props) => {
  const { deployments, assets, loading, error, department, onRefresh, onAdd, onUpdate, onDelete } = props;
  const [searchText, setSearchText] = React.useState<string>('');
  const debouncedSearch = useDebounce(searchText, 300);
  const [formOpen, setFormOpen] = React.useState<boolean>(false);
  const [editDeployment, setEditDeployment] = React.useState<Deployment | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = React.useState<Deployment | undefined>(undefined);

  const filteredDeployments = React.useMemo(() => {
    if (!debouncedSearch) return deployments;
    const normalized = normalizeText(debouncedSearch);
    return deployments.filter((d) =>
      normalizeText(d.Title || '').includes(normalized) ||
      normalizeText(d.AssetTitle || '').includes(normalized) ||
      normalizeText(d.DeployedTo || '').includes(normalized)
    );
  }, [deployments, debouncedSearch]);

  const commandBarItems: ICommandBarItemProps[] = [
    { key: 'new', text: strings.NewDeploymentButton, iconProps: { iconName: 'Add' }, onClick: () => { setEditDeployment(undefined); setFormOpen(true); } },
    { key: 'refresh', text: strings.RefreshButton, iconProps: { iconName: 'Refresh' }, onClick: onRefresh }
  ];

  const columns: IColumn[] = [
    { key: 'title', name: strings.ColumnDeploymentTitle, fieldName: 'Title', minWidth: 150, maxWidth: 220, isResizable: true },
    { key: 'asset', name: strings.ColumnAsset, fieldName: 'AssetTitle', minWidth: 120, maxWidth: 200, isResizable: true },
    { key: 'deployedTo', name: strings.ColumnDeployedTo, fieldName: 'DeployedTo', minWidth: 120, maxWidth: 180, isResizable: true },
    { key: 'department', name: strings.ColumnDepartment, fieldName: 'Department', minWidth: 100, maxWidth: 150, isResizable: true },
    {
      key: 'deployedDate', name: strings.ColumnDeployedDate, minWidth: 100, maxWidth: 140, isResizable: true,
      onRender: (item: Deployment) => <span>{item.DeployedDate ? new Date(item.DeployedDate).toLocaleDateString() : ''}</span>
    },
    {
      key: 'returnDate', name: strings.ColumnReturnDate, minWidth: 100, maxWidth: 140, isResizable: true,
      onRender: (item: Deployment) => <span>{item.ReturnDate ? new Date(item.ReturnDate).toLocaleDateString() : ''}</span>
    },
    {
      key: 'actions', name: strings.ColumnActions, minWidth: 80, maxWidth: 80,
      onRender: (item: Deployment) => (
        <Stack horizontal>
          <IconButton iconProps={{ iconName: 'Edit' }} title={strings.EditButton} onClick={() => { setEditDeployment(item); setFormOpen(true); }} />
          <IconButton iconProps={{ iconName: 'Delete' }} title={strings.DeleteButton} onClick={() => setDeleteTarget(item)} />
        </Stack>
      )
    }
  ];

  const handleDelete = async (): Promise<void> => {
    if (deleteTarget) {
      await onDelete(deleteTarget.Id);
      setDeleteTarget(undefined);
    }
  };

  return (
    <div className={styles.tabContent}>
      <CommandBar items={commandBarItems} />
      <div className={styles.searchBox}>
        <SearchBox placeholder={strings.SearchPlaceholder} value={searchText} onChange={(_, v) => setSearchText(v || '')} />
      </div>
      <Stack tokens={{ childrenGap: 8 }}>
        {error && <MessageBar messageBarType={MessageBarType.error} isMultiline={false}>{strings.ErrorPrefix}{error}</MessageBar>}
        {loading ? (
          <Spinner size={SpinnerSize.large} label={strings.LoadingMessage} />
        ) : (
          <DetailsList items={filteredDeployments} columns={columns} selectionMode={SelectionMode.none} layoutMode={DetailsListLayoutMode.justified} />
        )}
        {!loading && !error && filteredDeployments.length === 0 && (
          <MessageBar messageBarType={MessageBarType.info}>{strings.NoDeploymentsMessage}</MessageBar>
        )}
      </Stack>
      <DeploymentForm
        isOpen={formOpen}
        deployment={editDeployment}
        assets={assets}
        defaultDepartment={department}
        onSave={onAdd}
        onUpdate={onUpdate}
        onDismiss={() => setFormOpen(false)}
      />
      <Dialog
        hidden={!deleteTarget}
        onDismiss={() => setDeleteTarget(undefined)}
        dialogContentProps={{ type: DialogType.normal, title: strings.DeleteDeploymentTitle, subText: strings.DeleteDeploymentMessage }}
      >
        <DialogFooter>
          <PrimaryButton text={strings.DeleteButton} onClick={handleDelete} />
          <DefaultButton text={strings.CancelButton} onClick={() => setDeleteTarget(undefined)} />
        </DialogFooter>
      </Dialog>
    </div>
  );
};
