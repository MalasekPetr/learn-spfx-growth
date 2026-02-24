"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const React = tslib_1.__importStar(require("react"));
const ReactDom = tslib_1.__importStar(require("react-dom"));
const sp_webpart_base_1 = require("@microsoft/sp-webpart-base");
const strings = tslib_1.__importStar(require("Localization"));
const components_1 = require("../../components");
class MyWebPart extends sp_webpart_base_1.BaseClientSideWebPart {
    _isDarkTheme = false;
    _environmentMessage = '';
    render() {
        const element = React.createElement(components_1.My, {
            description: this.properties.description,
            isDarkTheme: this._isDarkTheme,
            hasTeamsContext: !!this.context.sdks.microsoftTeams,
            userDisplayName: this.context.pageContext.user.displayName,
            environmentMessage: this._environmentMessage,
        });
        ReactDom.render(element, this.domElement);
    }
    onInit() {
        return this._getEnvironmentMessage().then(message => {
            this._environmentMessage = message;
        });
    }
    _getEnvironmentMessage() {
        if (!!this.context.sdks.microsoftTeams) { // running in Teams, office.com or Outlook
            return this.context.sdks.microsoftTeams.teamsJs.app.getContext()
                .then(context => {
                let environmentMessage = '';
                switch (context.app.host.name) {
                    case 'Office': // running in Office
                        environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOffice : strings.AppOfficeEnvironment;
                        break;
                    case 'Outlook': // running in Outlook
                        environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOutlook : strings.AppOutlookEnvironment;
                        break;
                    case 'Teams': // running in Teams
                    case 'TeamsModern':
                        environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
                        break;
                    default:
                        environmentMessage = strings.UnknownEnvironment;
                }
                return environmentMessage;
            });
        }
        return Promise.resolve(this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment);
    }
    onThemeChanged(currentTheme) {
        if (!currentTheme) {
            return;
        }
        this._isDarkTheme = !!currentTheme.isInverted;
        const { semanticColors } = currentTheme;
        if (semanticColors) {
            this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
            this.domElement.style.setProperty('--link', semanticColors.link || null);
            this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
        }
    }
    onDispose() {
        ReactDom.unmountComponentAtNode(this.domElement);
    }
}
exports.default = MyWebPart;
//# sourceMappingURL=MyWebPart.js.map