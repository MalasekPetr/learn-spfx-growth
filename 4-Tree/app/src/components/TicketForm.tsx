import * as React from 'react';
import {
  Panel,
  PanelType,
  TextField,
  Dropdown,
  type IDropdownOption,
  PrimaryButton,
  DefaultButton,
  Stack,
  type IStackTokens
} from '@fluentui/react';
import * as strings from 'Localization';
import type { Ticket } from '../models';

type TicketFormProps = {
  isOpen: boolean;
  ticket: Ticket | undefined;
  onSave: (ticket: Omit<Ticket, 'Id' | 'Created' | 'Modified'>) => Promise<void>;
  onDismiss: () => void;
};

const STATUS_OPTIONS: IDropdownOption[] = [
  { key: 'New', text: 'New' },
  { key: 'In Progress', text: 'In Progress' },
  { key: 'Resolved', text: 'Resolved' },
  { key: 'Closed', text: 'Closed' }
];

const PRIORITY_OPTIONS: IDropdownOption[] = [
  { key: 'Low', text: 'Low' },
  { key: 'Medium', text: 'Medium' },
  { key: 'High', text: 'High' },
  { key: 'Critical', text: 'Critical' }
];

const CATEGORY_OPTIONS: IDropdownOption[] = [
  { key: 'Hardware', text: 'Hardware' },
  { key: 'Software', text: 'Software' },
  { key: 'Network', text: 'Network' },
  { key: 'Other', text: 'Other' }
];

const stackTokens: IStackTokens = { childrenGap: 12 };

export const TicketForm: React.FunctionComponent<TicketFormProps> = (props) => {
  const { isOpen, ticket, onSave, onDismiss } = props;

  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [status, setStatus] = React.useState('New');
  const [priority, setPriority] = React.useState('Medium');
  const [category, setCategory] = React.useState('Other');
  const [assignedTo, setAssignedTo] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (ticket) {
      setTitle(ticket.Title || '');
      setDescription(ticket.Description || '');
      setStatus(ticket.Status || 'New');
      setPriority(ticket.Priority || 'Medium');
      setCategory(ticket.Category || 'Other');
      setAssignedTo(ticket.AssignedTo || '');
    } else {
      setTitle('');
      setDescription('');
      setStatus('New');
      setPriority('Medium');
      setCategory('Other');
      setAssignedTo('');
    }
  }, [ticket, isOpen]);

  const handleSave = React.useCallback(async (): Promise<void> => {
    setSaving(true);
    try {
      await onSave({
        Title: title,
        Description: description,
        Status: status,
        Priority: priority,
        Category: category,
        AssignedTo: assignedTo
      });
      onDismiss();
    } finally {
      setSaving(false);
    }
  }, [title, description, status, priority, category, assignedTo, onSave, onDismiss]);

  return (
    <Panel
      isOpen={isOpen}
      type={PanelType.medium}
      headerText={ticket ? strings.EditTicket : strings.NewTicket}
      onDismiss={onDismiss}
      isFooterAtBottom={true}
      onRenderFooterContent={() => (
        <Stack horizontal tokens={stackTokens}>
          <PrimaryButton text={strings.SaveButton} onClick={handleSave} disabled={saving || !title} />
          <DefaultButton text={strings.CancelButton} onClick={onDismiss} />
        </Stack>
      )}
    >
      <Stack tokens={stackTokens}>
        <TextField label={strings.FieldTitle} value={title} onChange={(_, v) => setTitle(v || '')} required />
        <TextField label={strings.FieldDescription} value={description} onChange={(_, v) => setDescription(v || '')} multiline rows={4} />
        <Dropdown label={strings.FieldStatus} selectedKey={status} options={STATUS_OPTIONS} onChange={(_, o) => setStatus(o?.key as string || 'New')} />
        <Dropdown label={strings.FieldPriority} selectedKey={priority} options={PRIORITY_OPTIONS} onChange={(_, o) => setPriority(o?.key as string || 'Medium')} />
        <Dropdown label={strings.FieldCategory} selectedKey={category} options={CATEGORY_OPTIONS} onChange={(_, o) => setCategory(o?.key as string || 'Other')} />
        <TextField label={strings.FieldAssignedTo} value={assignedTo} onChange={(_, v) => setAssignedTo(v || '')} />
      </Stack>
    </Panel>
  );
};
