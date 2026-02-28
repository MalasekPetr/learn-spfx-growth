import * as React from 'react';
import {
  Panel,
  TextField,
  Dropdown,
  type IDropdownOption,
  DatePicker,
  PrimaryButton,
  DefaultButton,
  Stack
} from '@fluentui/react';
import * as strings from 'Localization';
import type { Asset, Deployment } from '../models';

type DeploymentFormProps = {
  isOpen: boolean;
  deployment: Deployment | undefined;
  assets: Asset[];
  defaultDepartment: string;
  onSave: (deployment: Omit<Deployment, 'Id' | 'AssetTitle' | 'Created' | 'Modified'>) => Promise<void>;
  onUpdate: (id: number, deployment: Partial<Deployment>) => Promise<void>;
  onDismiss: () => void;
};

export const DeploymentForm: React.FunctionComponent<DeploymentFormProps> = (props) => {
  const { isOpen, deployment, assets, defaultDepartment, onSave, onUpdate, onDismiss } = props;

  const [title, setTitle] = React.useState<string>('');
  const [assetId, setAssetId] = React.useState<number | undefined>(undefined);
  const [deployedTo, setDeployedTo] = React.useState<string>('');
  const [department, setDepartment] = React.useState<string>('');
  const [deployedDate, setDeployedDate] = React.useState<Date | undefined>(undefined);
  const [returnDate, setReturnDate] = React.useState<Date | undefined>(undefined);
  const [notes, setNotes] = React.useState<string>('');

  React.useEffect(() => {
    if (isOpen && deployment) {
      setTitle(deployment.Title);
      setAssetId(deployment.AssetId);
      setDeployedTo(deployment.DeployedTo);
      setDepartment(deployment.Department);
      setDeployedDate(deployment.DeployedDate ? new Date(deployment.DeployedDate) : undefined);
      setReturnDate(deployment.ReturnDate ? new Date(deployment.ReturnDate) : undefined);
      setNotes(deployment.Notes);
    } else if (isOpen) {
      setTitle('');
      setAssetId(undefined);
      setDeployedTo('');
      setDepartment(defaultDepartment);
      setDeployedDate(new Date());
      setReturnDate(undefined);
      setNotes('');
    }
  }, [isOpen, deployment, defaultDepartment]);

  const assetOptions: IDropdownOption[] = React.useMemo(
    () => assets.map((a) => ({ key: a.Id, text: a.Title })),
    [assets]
  );

  const handleSave = async (): Promise<void> => {
    if (!assetId) return;
    const data = {
      Title: title,
      AssetId: assetId,
      DeployedTo: deployedTo,
      Department: department,
      DeployedDate: deployedDate ? deployedDate.toISOString() : new Date().toISOString(),
      ReturnDate: returnDate ? returnDate.toISOString() : null,
      Notes: notes,
    };
    if (deployment) {
      await onUpdate(deployment.Id, data);
    } else {
      await onSave(data);
    }
    onDismiss();
  };

  const canSave = title.trim() && assetId;

  return (
    <Panel
      isOpen={isOpen}
      onDismiss={onDismiss}
      headerText={deployment ? strings.EditDeployment : strings.NewDeployment}
      isFooterAtBottom={true}
      onRenderFooterContent={() => (
        <Stack horizontal tokens={{ childrenGap: 8 }}>
          <PrimaryButton text={strings.SaveButton} onClick={handleSave} disabled={!canSave} />
          <DefaultButton text={strings.CancelButton} onClick={onDismiss} />
        </Stack>
      )}
    >
      <Stack tokens={{ childrenGap: 12 }}>
        <TextField label={strings.FieldDeploymentTitle} value={title} onChange={(_, v) => setTitle(v || '')} required />
        <Dropdown label={strings.FieldAsset} selectedKey={assetId} options={assetOptions} onChange={(_, o) => setAssetId(o?.key as number)} required />
        <TextField label={strings.FieldDeployedTo} value={deployedTo} onChange={(_, v) => setDeployedTo(v || '')} />
        <TextField label={strings.FieldDepartment} value={department} onChange={(_, v) => setDepartment(v || '')} />
        <DatePicker label={strings.FieldDeployedDate} value={deployedDate} onSelectDate={(d) => setDeployedDate(d || undefined)} />
        <DatePicker label={strings.FieldReturnDate} value={returnDate} onSelectDate={(d) => setReturnDate(d || undefined)} />
        <TextField label={strings.FieldNotes} value={notes} onChange={(_, v) => setNotes(v || '')} multiline rows={3} />
      </Stack>
    </Panel>
  );
};
