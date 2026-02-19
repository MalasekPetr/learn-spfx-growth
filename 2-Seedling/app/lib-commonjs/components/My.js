"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.My = void 0;
const tslib_1 = require("tslib");
const React = tslib_1.__importStar(require("react"));
const react_1 = require("@fluentui/react");
const strings = tslib_1.__importStar(require("Localization"));
const hooks_1 = require("../hooks");
const App_module_scss_1 = tslib_1.__importDefault(require("../styles/App.module.scss"));
const My = (props) => {
    const { graphClient, isDarkTheme, hasTeamsContext } = props;
    const { items, loading, error, breadcrumb, navigateToFolder, navigateToBreadcrumb, refresh } = (0, hooks_1.useOneDrive)(graphClient);
    const breadcrumbItems = breadcrumb.map((item, index) => ({
        text: item.name,
        key: item.id,
        onClick: index < breadcrumb.length - 1
            ? () => navigateToBreadcrumb(index)
            : undefined,
        isCurrentItem: index === breadcrumb.length - 1
    }));
    const commandBarItems = [
        {
            key: 'refresh',
            text: strings.RefreshButton,
            iconProps: { iconName: 'Refresh' },
            onClick: refresh
        }
    ];
    const onItemInvoked = React.useCallback((item) => {
        if (item.folder) {
            navigateToFolder(item.id, item.name);
        }
        else {
            window.open(item.webUrl, '_blank', 'noopener,noreferrer');
        }
    }, [navigateToFolder]);
    const columns = [
        {
            key: 'icon',
            name: '',
            minWidth: 20,
            maxWidth: 20,
            onRender: (item) => (React.createElement(react_1.Icon, { iconName: item.folder ? 'FabricFolder' : 'Page' }))
        },
        {
            key: 'name',
            name: strings.ColumnName,
            fieldName: 'name',
            minWidth: 200,
            maxWidth: 400,
            isResizable: true,
            onRender: (item) => (React.createElement("span", { className: item.folder ? App_module_scss_1.default.folderName : undefined }, item.name))
        },
        {
            key: 'lastModifiedDateTime',
            name: strings.ColumnModified,
            fieldName: 'lastModifiedDateTime',
            minWidth: 150,
            maxWidth: 200,
            isResizable: true,
            onRender: (item) => (React.createElement("span", null, new Date(item.lastModifiedDateTime).toLocaleString()))
        },
        {
            key: 'size',
            name: strings.ColumnSize,
            fieldName: 'size',
            minWidth: 80,
            maxWidth: 120,
            isResizable: true,
            onRender: (item) => (React.createElement("span", null, item.folder ? '' : formatFileSize(item.size)))
        }
    ];
    return (React.createElement("section", { className: `${App_module_scss_1.default.app} ${hasTeamsContext ? App_module_scss_1.default.teams : ''} ${isDarkTheme ? App_module_scss_1.default.dark : ''}` },
        React.createElement(react_1.CommandBar, { items: commandBarItems }),
        React.createElement(react_1.Breadcrumb, { items: breadcrumbItems }),
        React.createElement(react_1.Stack, { tokens: { childrenGap: 8 } },
            error && (React.createElement(react_1.MessageBar, { messageBarType: react_1.MessageBarType.error, isMultiline: false },
                strings.ErrorPrefix,
                error)),
            loading ? (React.createElement(react_1.Spinner, { size: react_1.SpinnerSize.large, label: strings.LoadingMessage })) : (React.createElement(react_1.DetailsList, { items: items, columns: columns, selectionMode: react_1.SelectionMode.none, layoutMode: react_1.DetailsListLayoutMode.justified, onItemInvoked: onItemInvoked })),
            !loading && !error && items.length === 0 && (React.createElement(react_1.MessageBar, { messageBarType: react_1.MessageBarType.info }, strings.EmptyFolderMessage)))));
};
exports.My = My;
function formatFileSize(bytes) {
    if (bytes === 0)
        return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, i);
    return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
//# sourceMappingURL=My.js.map