import * as React from 'react';
import type { AppProps } from '../models';
import styles from '../styles/App.module.scss';

export function App(props: AppProps): JSX.Element {
  const { webPartProps, isDarkTheme, userDisplayName, environmentMessage } = props;

  return (
    <section className={`${styles.app} ${isDarkTheme ? styles.dark : ''}`}>
      <h2>Welcome, {userDisplayName}!</h2>
      <p>{webPartProps.description}</p>
      <p>{environmentMessage}</p>
    </section>
  );
}