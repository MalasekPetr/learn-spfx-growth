"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.My = void 0;
const tslib_1 = require("tslib");
const React = tslib_1.__importStar(require("react"));
const App_module_scss_1 = tslib_1.__importDefault(require("../styles/App.module.scss"));
const My = (props) => {
    const { description, isDarkTheme, hasTeamsContext, userDisplayName, environmentMessage } = props;
    return (React.createElement("section", { className: `${App_module_scss_1.default.app} ${hasTeamsContext ? App_module_scss_1.default.teams : ''} ${isDarkTheme ? App_module_scss_1.default.dark : ''}` },
        React.createElement("h2", null,
            "Welcome, ",
            userDisplayName,
            "!"),
        React.createElement("p", null, description),
        React.createElement("p", null, environmentMessage)));
};
exports.My = My;
//# sourceMappingURL=My.js.map