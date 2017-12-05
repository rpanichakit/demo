var WwxDemo;
(function (WwxDemo) {
    var HtmlContainerComponent = /** @class */ (function () {
        function HtmlContainerComponent() {
        }
        return HtmlContainerComponent;
    }());
    angular.module('wwxDemo')
        .component('htmlContainer', {
        controller: HtmlContainerComponent,
        template: "\n            <div id=\"canvas-container\" \n                ng-mouseup=\"$ctrl.canvasMouseUp($event)\" \n                ng-click=\"$ctrl.canvasClicked($event)\" \n                ng-mousemove=\"$ctrl.canvasMouseMove($event)\">\n            </div>\n            "
    });
})(WwxDemo || (WwxDemo = {}));
//# sourceMappingURL=html-container.component.js.map