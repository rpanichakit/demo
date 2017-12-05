var WwxDemo;
(function (WwxDemo) {
    var ToolbarItemComponent = /** @class */ (function () {
        function ToolbarItemComponent() {
            this.IconType = WwxDemo.IconType;
        }
        ToolbarItemComponent.prototype.$onInit = function () {
        };
        return ToolbarItemComponent;
    }());
    angular.module('wwxDemo')
        .component('toolbarItem', {
        controller: ToolbarItemComponent,
        bindings: {
            title: '<',
            selectable: '<',
            mode: '<',
            icon: '<',
            selected: '<',
            onItemClicked: '&'
        },
        template: "\n                <div title=\"{{$ctrl.title}}\" class=\"label-wrapper\" ng-class=\"{selected:$ctrl.selected}\" ng-click=\"$ctrl.onItemClicked({mode: $ctrl.mode})\">\n                    <div class=\"tab-label\">\n                        <i ng-if=\"$ctrl.icon.type === $ctrl.IconType.Icon\" class=\"fa fa-{{$ctrl.icon.value}}\" aria-hidden=\"true\"></i>\n                        <img ng-if=\"$ctrl.icon.type === $ctrl.IconType.Image\" ng-src=\"{{$ctrl.icon.value}}\" />\n                        <div ng-if=\"$ctrl.icon.type === $ctrl.IconType.Div\" id=\"{{$ctrl.icon.value}}\">{{$ctrl.icon.text}}</div>\n                    </div>\n                </div>\n            "
    });
})(WwxDemo || (WwxDemo = {}));
//# sourceMappingURL=toolbar-item.component.js.map