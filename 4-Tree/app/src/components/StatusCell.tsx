import * as React from 'react';
import type { GridCellProps } from '@progress/kendo-react-grid';
import styles from '../styles/App.module.scss';

const STATUS_CLASSES: Record<string, string> = {
  'New': styles.statusNew,
  'In Progress': styles.statusInProgress,
  'Resolved': styles.statusResolved,
  'Closed': styles.statusClosed
};

export const StatusCell: React.FunctionComponent<GridCellProps> = (props) => {
  const value = props.dataItem[props.field || ''] as string;
  return (
    <td>
      <span className={`${styles.badge} ${STATUS_CLASSES[value] || ''}`}>
        {value}
      </span>
    </td>
  );
};
