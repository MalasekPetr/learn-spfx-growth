import * as React from 'react';
import {
  Panel,
  TextField,
  Dropdown,
  type IDropdownOption,
  PrimaryButton,
  DefaultButton,
  Stack
} from '@fluentui/react';
import * as strings from 'Localization';
import type { Asset } from '../models';

type AssetFormProps = {
  isOpen: boolean;
  asset: Asset | undefined;
  onSave: (asset: Omit<Asset, 'Id' | 'Created' | 'Modified'>) => Promise<void>;
  onUpdate: (id: number, asset: Partial<Asset>) => Promise<void>;
  onDismiss: () => void;
};

const CATEGORY_OPTIONS: IDropdownOption[] = [
  { key: 'Laptop', text: 'Laptop' },
  { key: 'Monitor', text: 'Monitor' },
  { key: 'Phone', text: 'Phone' },
  { key: 'Printer', text: 'Printer' },
  { key: 'Accessory', text: 'Accessory' },
  { key: 'Other', text: 'Other' },
];

const STATUS_OPTIONS: IDropdownOption[] = [
  { key: 'Available', text: 'Available' },
  { key: 'Deployed', text: 'Deployed' },
  { key: 'Maintenance', text: 'Maintenance' },
  { key: 'Retired', text: 'Retired' },
];

export const AssetForm: React.FunctionComponent<AssetFormProps> = (props) => {
  const { isOpen, asset, onSave, onUpdate, onDismiss } = props;

  const [title, setTitle] = React.useState<string>('');
  const [description, setDescription] = React.useState<string>('');
  const [category, setCategory] = React.useState<string>('Other');
  const [serialNumber, setSerialNumber] = React.useState<string>('');
  const [status, setStatus] = React.useState<string>('Available');

  React.useEffect(() => {
    if (isOpen && asset) {
      setTitle(asset.Title);
      setDescription(asset.Description);
      setCategory(asset.Category);
      setSerialNumber(asset.SerialNumber);
      setStatus(asset.Status);
    } else if (isOpen) {
      setTitle('');
      setDescription('');
      setCategory('Other');
      setSerialNumber('');
      setStatus('Available');
    }
  }, [isOpen, asset]);

  const handleSave = async (): Promise<void> => {
    const data = { Title: title, Description: description, Category: category, SerialNumber: serialNumber, Status: status };
    if (asset) {
      await onUpdate(asset.Id, data);
    } else {
      await onSave(data);
    }
    onDismiss();
  };

  return (
    <Panel
      isOpen={isOpen}
      onDismiss={onDismiss}
      headerText={asset ? strings.EditAsset : strings.NewAsset}
      isFooterAtBottom={true}
      onRenderFooterContent={() => (
        <Stack horizontal tokens={{ childrenGap: 8 }}>
          <PrimaryButton text={strings.SaveButton} onClick={handleSave} disabled={!title.trim()} />
          <DefaultButton text={strings.CancelButton} onClick={onDismiss} />
        </Stack>
      )}
    >
      <Stack tokens={{ childrenGap: 12 }}>
        <TextField label={strings.FieldAssetTitle} value={title} onChange={(_, v) => setTitle(v || '')} required />
        <TextField label={strings.FieldDescription} value={description} onChange={(_, v) => setDescription(v || '')} multiline rows={3} />
        <Dropdown label={strings.FieldCategory} selectedKey={category} options={CATEGORY_OPTIONS} onChange={(_, o) => setCategory((o?.key as string) || 'Other')} />
        <TextField label={strings.FieldSerialNumber} value={serialNumber} onChange={(_, v) => setSerialNumber(v || '')} />
        <Dropdown label={strings.FieldAssetStatus} selectedKey={status} options={STATUS_OPTIONS} onChange={(_, o) => setStatus((o?.key as string) || 'Available')} />
      </Stack>
    </Panel>
  );
};
