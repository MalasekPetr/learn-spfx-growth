import * as React from 'react';
import type { MyProps } from '../models';
import styles from '../styles/App.module.scss';

export const My: React.FunctionComponent<MyProps> = (props) => {
  const { description, isDarkTheme, hasTeamsContext, userDisplayName, environmentMessage } = props;

  return (
    <section className={`${styles.app} ${hasTeamsContext ? styles.teams : ''} ${isDarkTheme ? styles.dark : ''}`}>
      <h2>Welcome, {userDisplayName}!</h2>
      <p>{description}</p>
      <p>{environmentMessage}</p>
    </section>
  );
};