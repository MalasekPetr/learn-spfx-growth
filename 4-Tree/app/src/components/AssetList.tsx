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
import type { Asset } from '../models';
import { useDebounce } from '../hooks';
import { normalizeText } from '../utils';
import { StatusBadge } from './StatusBadge';
import { AssetForm } from './AssetForm';
import styles from '../styles/App.module.scss';

type AssetListProps = {
  assets: Asset[];
  loading: boolean;
  error: string | undefined;
  onRefresh: () => void;
  onAdd: (asset: Omit<Asset, 'Id' | 'Created' | 'Modified'>) => Promise<void>;
  onUpdate: (id: number, asset: Partial<Asset>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
};

export const AssetList: React.FunctionComponent<AssetListProps> = (props) => {
  const { assets, loading, error, onRefresh, onAdd, onUpdate, onDelete } = props;
  const [searchText, setSearchText] = React.useState<string>('');
  const debouncedSearch = useDebounce(searchText, 300);
  const [formOpen, setFormOpen] = React.useState<boolean>(false);
  const [editAsset, setEditAsset] = React.useState<Asset | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = React.useState<Asset | undefined>(undefined);

  const filteredAssets = React.useMemo(() => {
    if (!debouncedSearch) return assets;
    const normalized = normalizeText(debouncedSearch);
    return assets.filter((a) =>
      normalizeText(a.Title || '').includes(normalized) ||
      normalizeText(a.Category || '').includes(normalized) ||
      normalizeText(a.SerialNumber || '').includes(normalized)
    );
  }, [assets, debouncedSearch]);

  const commandBarItems: ICommandBarItemProps[] = [
    { key: 'new', text: strings.NewAssetButton, iconProps: { iconName: 'Add' }, onClick: () => { setEditAsset(undefined); setFormOpen(true); } },
    { key: 'refresh', text: strings.RefreshButton, iconProps: { iconName: 'Refresh' }, onClick: onRefresh }
  ];

  const columns: IColumn[] = [
    { key: 'title', name: strings.ColumnAssetTitle, fieldName: 'Title', minWidth: 150, maxWidth: 250, isResizable: true },
    { key: 'category', name: strings.ColumnCategory, fieldName: 'Category', minWidth: 100, maxWidth: 150, isResizable: true },
    { key: 'serialNumber', name: strings.ColumnSerialNumber, fieldName: 'SerialNumber', minWidth: 120, maxWidth: 180, isResizable: true },
    {
      key: 'status', name: strings.ColumnAssetStatus, minWidth: 100, maxWidth: 140, isResizable: true,
      onRender: (item: Asset) => <StatusBadge value={item.Status} />
    },
    {
      key: 'actions', name: strings.ColumnActions, minWidth: 80, maxWidth: 80,
      onRender: (item: Asset) => (
        <Stack horizontal>
          <IconButton iconProps={{ iconName: 'Edit' }} title={strings.EditButton} onClick={() => { setEditAsset(item); setFormOpen(true); }} />
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
          <DetailsList items={filteredAssets} columns={columns} selectionMode={SelectionMode.none} layoutMode={DetailsListLayoutMode.justified} />
        )}
        {!loading && !error && filteredAssets.length === 0 && (
          <MessageBar messageBarType={MessageBarType.info}>{strings.NoAssetsMessage}</MessageBar>
        )}
      </Stack>
      <AssetForm isOpen={formOpen} asset={editAsset} onSave={onAdd} onUpdate={onUpdate} onDismiss={() => setFormOpen(false)} />
      <Dialog
        hidden={!deleteTarget}
        onDismiss={() => setDeleteTarget(undefined)}
        dialogContentProps={{ type: DialogType.normal, title: strings.DeleteAssetTitle, subText: strings.DeleteAssetMessage }}
      >
        <DialogFooter>
          <PrimaryButton text={strings.DeleteButton} onClick={handleDelete} />
          <DefaultButton text={strings.CancelButton} onClick={() => setDeleteTarget(undefined)} />
        </DialogFooter>
      </Dialog>
    </div>
  );
};
