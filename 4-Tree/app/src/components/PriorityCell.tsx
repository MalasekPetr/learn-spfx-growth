import * as React from 'react';
import type { GridCellProps } from '@progress/kendo-react-grid';
import styles from '../styles/App.module.scss';

const PRIORITY_CLASSES: Record<string, string> = {
  'Low': styles.priorityLow,
  'Medium': styles.priorityMedium,
  'High': styles.priorityHigh,
  'Critical': styles.priorityCritical
};

export const PriorityCell: React.FunctionComponent<GridCellProps> = (props) => {
  const value = props.dataItem[props.field || ''] as string;
  return (
    <td>
      <span className={`${styles.badge} ${PRIORITY_CLASSES[value] || ''}`}>
        {value}
      </span>
    </td>
  );
};
