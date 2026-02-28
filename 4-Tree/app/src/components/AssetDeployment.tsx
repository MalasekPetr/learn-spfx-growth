import * as React from 'react';
import {
  Pivot,
  PivotItem,
  Spinner,
  SpinnerSize,
  MessageBar,
  MessageBarType
} from '@fluentui/react';
import * as strings from 'Localization';
import type { AssetDeploymentProps } from '../models';
import { useAssets, useDeployments, useCurrentUser } from '../hooks';
import { AssetList } from './AssetList';
import { DeploymentList } from './DeploymentList';
import styles from '../styles/App.module.scss';

export const AssetDeployment: React.FunctionComponent<AssetDeploymentProps> = (props) => {
  const { webPartProps, sp, userDepartment, isDarkTheme, hasTeamsContext } = props;
  const { assetsListName, deploymentsListName } = webPartProps;

  const { userInfo, loading: userLoading, error: userError } = useCurrentUser(sp);
  const department = userDepartment || userInfo?.department || '';

  const assetsHook = useAssets(sp, assetsListName);
  const deploymentsHook = useDeployments(sp, deploymentsListName, department);

  if (userLoading && !userDepartment) {
    return <Spinner size={SpinnerSize.large} label={strings.LoadingUserMessage} />;
  }

  return (
    <section className={`${styles.app} ${hasTeamsContext ? styles.teams : ''} ${isDarkTheme ? styles.dark : ''}`}>
      {userError && (
        <MessageBar messageBarType={MessageBarType.warning}>
          {strings.UserErrorPrefix}{userError}
        </MessageBar>
      )}
      <Pivot>
        <PivotItem headerText={strings.AssetsTab}>
          <AssetList
            assets={assetsHook.assets}
            loading={assetsHook.loading}
            error={assetsHook.error}
            onRefresh={assetsHook.refresh}
            onAdd={assetsHook.addAsset}
            onUpdate={assetsHook.updateAsset}
            onDelete={assetsHook.deleteAsset}
          />
        </PivotItem>
        <PivotItem headerText={strings.DeploymentsTab}>
          <DeploymentList
            deployments={deploymentsHook.deployments}
            assets={assetsHook.assets}
            loading={deploymentsHook.loading}
            error={deploymentsHook.error}
            department={department}
            onRefresh={deploymentsHook.refresh}
            onAdd={deploymentsHook.addDeployment}
            onUpdate={deploymentsHook.updateDeployment}
            onDelete={deploymentsHook.deleteDeployment}
          />
        </PivotItem>
      </Pivot>
    </section>
  );
};
