"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.My = My;
const tslib_1 = require("tslib");
const React = tslib_1.__importStar(require("react"));
const App_module_scss_1 = tslib_1.__importDefault(require("../styles/App.module.scss"));
function My(props) {
    const { description, isDarkTheme, userDisplayName, environmentMessage } = props;
    return (React.createElement("section", { className: `${App_module_scss_1.default.app} ${isDarkTheme ? App_module_scss_1.default.dark : ''}` },
        React.createElement("h2", null,
            "Welcome, ",
            userDisplayName,
            "!"),
        React.createElement("p", null, description),
        React.createElement("p", null, environmentMessage)));
}
//# sourceMappingURL=My.js.map