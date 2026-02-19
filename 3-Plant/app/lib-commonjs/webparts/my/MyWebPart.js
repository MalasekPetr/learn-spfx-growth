"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const React = tslib_1.__importStar(require("react"));
const ReactDom = tslib_1.__importStar(require("react-dom"));
const sp_core_library_1 = require("@microsoft/sp-core-library");
const sp_property_pane_1 = require("@microsoft/sp-property-pane");
const sp_webpart_base_1 = require("@microsoft/sp-webpart-base");
const strings = tslib_1.__importStar(require("Localization"));
const components_1 = require("../../components");
class MyWebPart extends sp_webpart_base_1.BaseClientSideWebPart {
    _isDarkTheme = false;
    _graphClient;
    render() {
        const element = React.createElement(components_1.My, {
            graphClient: this._graphClient,
            isDarkTheme: this._isDarkTheme,
            hasTeamsContext: !!this.context.sdks.microsoftTeams,
            showDepartment: this.properties.showDepartment,
            showJobTitle: this.properties.showJobTitle,
            showEmail: this.properties.showEmail,
            showMobilePhone: this.properties.showMobilePhone,
            showBusinessPhone: this.properties.showBusinessPhone
        });
        ReactDom.render(element, this.domElement);
    }
    onInit() {
        return this.context.msGraphClientFactory
            .getClient('3')
            .then((client) => {
            this._graphClient = client;
        });
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
    get dataVersion() {
        return sp_core_library_1.Version.parse('1.0');
    }
    getPropertyPaneConfiguration() {
        return {
            pages: [
                {
                    header: {
                        description: strings.PropertyPaneDescription
                    },
                    groups: [
                        {
                            groupName: strings.BasicGroupName,
                            groupFields: [
                                (0, sp_property_pane_1.PropertyPaneTextField)('description', {
                                    label: strings.DescriptionFieldLabel
                                })
                            ]
                        },
                        {
                            groupName: strings.ColumnsGroupName,
                            groupFields: [
                                (0, sp_property_pane_1.PropertyPaneToggle)('showDepartment', {
                                    label: strings.ShowDepartment
                                }),
                                (0, sp_property_pane_1.PropertyPaneToggle)('showJobTitle', {
                                    label: strings.ShowJobTitle
                                }),
                                (0, sp_property_pane_1.PropertyPaneToggle)('showEmail', {
                                    label: strings.ShowEmail
                                }),
                                (0, sp_property_pane_1.PropertyPaneToggle)('showMobilePhone', {
                                    label: strings.ShowMobilePhone
                                }),
                                (0, sp_property_pane_1.PropertyPaneToggle)('showBusinessPhone', {
                                    label: strings.ShowBusinessPhone
                                })
                            ]
                        }
                    ]
                }
            ]
        };
    }
}
exports.default = MyWebPart;
//# sourceMappingURL=MyWebPart.js.map