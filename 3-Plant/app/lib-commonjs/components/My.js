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
    const { graphClient, isDarkTheme, hasTeamsContext, showDepartment, showJobTitle, showEmail, showMobilePhone, showBusinessPhone } = props;
    const [searchText, setSearchText] = React.useState('');
    const debouncedSearch = (0, hooks_1.useDebounce)(searchText, 300);
    const { users, loading, error, refresh } = (0, hooks_1.useUsers)(graphClient, debouncedSearch);
    const commandBarItems = [
        {
            key: 'refresh',
            text: strings.RefreshButton,
            iconProps: { iconName: 'Refresh' },
            onClick: refresh
        }
    ];
    const columns = React.useMemo(() => {
        const cols = [
            {
                key: 'displayName',
                name: strings.ColumnDisplayName,
                fieldName: 'displayName',
                minWidth: 150,
                maxWidth: 250,
                isResizable: true
            }
        ];
        if (showDepartment) {
            cols.push({
                key: 'department',
                name: strings.ColumnDepartment,
                fieldName: 'department',
                minWidth: 120,
                maxWidth: 200,
                isResizable: true
            });
        }
        if (showJobTitle) {
            cols.push({
                key: 'jobTitle',
                name: strings.ColumnJobTitle,
                fieldName: 'jobTitle',
                minWidth: 120,
                maxWidth: 200,
                isResizable: true
            });
        }
        if (showEmail) {
            cols.push({
                key: 'mail',
                name: strings.ColumnEmail,
                fieldName: 'mail',
                minWidth: 180,
                maxWidth: 280,
                isResizable: true
            });
        }
        if (showMobilePhone) {
            cols.push({
                key: 'mobilePhone',
                name: strings.ColumnMobilePhone,
                fieldName: 'mobilePhone',
                minWidth: 120,
                maxWidth: 160,
                isResizable: true
            });
        }
        if (showBusinessPhone) {
            cols.push({
                key: 'businessPhones',
                name: strings.ColumnBusinessPhone,
                minWidth: 120,
                maxWidth: 160,
                isResizable: true,
                onRender: (item) => (React.createElement("span", null, item.businessPhones?.[0] || ''))
            });
        }
        return cols;
    }, [showDepartment, showJobTitle, showEmail, showMobilePhone, showBusinessPhone]);
    return (React.createElement("section", { className: `${App_module_scss_1.default.app} ${hasTeamsContext ? App_module_scss_1.default.teams : ''} ${isDarkTheme ? App_module_scss_1.default.dark : ''}` },
        React.createElement(react_1.CommandBar, { items: commandBarItems }),
        React.createElement("div", { className: App_module_scss_1.default.searchBox },
            React.createElement(react_1.SearchBox, { placeholder: strings.SearchPlaceholder, value: searchText, onChange: (_, newValue) => setSearchText(newValue || '') })),
        React.createElement(react_1.Stack, { tokens: { childrenGap: 8 } },
            error && (React.createElement(react_1.MessageBar, { messageBarType: react_1.MessageBarType.error, isMultiline: false },
                strings.ErrorPrefix,
                error)),
            loading ? (React.createElement(react_1.Spinner, { size: react_1.SpinnerSize.large, label: strings.LoadingMessage })) : (React.createElement(react_1.DetailsList, { items: users, columns: columns, selectionMode: react_1.SelectionMode.none, layoutMode: react_1.DetailsListLayoutMode.justified })),
            !loading && !error && users.length === 0 && (React.createElement(react_1.MessageBar, { messageBarType: react_1.MessageBarType.info }, strings.NoResultsMessage)))));
};
exports.My = My;
//# sourceMappingURL=My.js.map