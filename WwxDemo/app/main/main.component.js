var WwxDemo;
(function (WwxDemo) {
    var MainComponent = /** @class */ (function () {
        function MainComponent() {
            this.showToolbar = true;
            this.mode = WwxDemo.EditMode.None;
        }
        MainComponent.prototype.onToolSelect = function (mode) {
            if (mode === this.mode) {
                this.mode = WwxDemo.EditMode.None;
            }
            else {
                switch (mode) {
                    case WwxDemo.EditMode.Clear:
                        this.clearScreen();
                        break;
                    case WwxDemo.EditMode.Export:
                        this.export();
                        break;
                    case WwxDemo.EditMode.Maximize:
                        this.hideToolbar();
                        break;
                    case WwxDemo.EditMode.Logout:
                        this.logout();
                        break;
                    default:
                        this.mode = mode;
                }
            }
        };
        MainComponent.prototype.hideToolbar = function () {
        };
        MainComponent.prototype.clearScreen = function () {
        };
        MainComponent.prototype.export = function () {
        };
        MainComponent.prototype.logout = function () {
        };
        MainComponent.prototype.onScaleChanged = function () {
        };
        MainComponent.prototype.onUnitIdChanged = function () {
        };
        return MainComponent;
    }());
    angular.module('wwxDemo').component('main', {
        controller: MainComponent,
        template: "\n            <html-container></html-container>\n            <canvas-container></canvas-container>\n            <svg-container></svg-container>\n            <dots-labels></dots-labels>\n            <menu-button></menu-button>\n            <toolbar show=\"$ctrl.showToolbar\" current-mode=\"$ctrl.mode\" on-tool-select=\"$ctrl.onToolSelect(mode)\"></toolbar>\n            <!--<properties-panel></properties-panel>-->\n            <powered-by></powered-by>\n        "
    });
})(WwxDemo || (WwxDemo = {}));
//# sourceMappingURL=main.component.js.map