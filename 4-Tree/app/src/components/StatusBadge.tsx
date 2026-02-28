import * as React from 'react';
import styles from '../styles/App.module.scss';

type StatusBadgeProps = {
  value: string;
};

const STATUS_CLASSES: Record<string, string> = {
  'Available': styles.statusAvailable,
  'Deployed': styles.statusDeployed,
  'Maintenance': styles.statusMaintenance,
  'Retired': styles.statusRetired,
};

export const StatusBadge: React.FunctionComponent<StatusBadgeProps> = ({ value }) => (
  <span className={`${styles.badge} ${STATUS_CLASSES[value] || ''}`}>
    {value}
  </span>
);
