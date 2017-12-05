var WwxDemo;
(function (WwxDemo) {
    var ToolbarComponent = /** @class */ (function () {
        function ToolbarComponent() {
            this.items = [
                {
                    title: 'configuration',
                    selectable: true,
                    mode: WwxDemo.EditMode.Config,
                    icon: {
                        type: WwxDemo.IconType.Icon,
                        value: 'wrench'
                    }
                },
                {
                    title: 'ruler',
                    selectable: true,
                    mode: WwxDemo.EditMode.Ruler,
                    icon: {
                        type: WwxDemo.IconType.Image,
                        value: '/images/ruler.png'
                    }
                },
                {
                    title: 'setup room boundary',
                    selectable: true,
                    mode: WwxDemo.EditMode.Boundary,
                    icon: {
                        type: WwxDemo.IconType.Div,
                        value: 'boundary-icon'
                    }
                },
                {
                    title: 'setup chairs',
                    selectable: true,
                    mode: WwxDemo.EditMode.Chairs,
                    icon: {
                        type: WwxDemo.IconType.Image,
                        value: '/images/chair.svg'
                    }
                },
                {
                    title: 'draw zones',
                    selectable: true,
                    mode: WwxDemo.EditMode.Zone,
                    icon: {
                        type: WwxDemo.IconType.Div,
                        value: 'zone-icon',
                        text: 'z'
                    }
                },
                {
                    title: 'draw rectangles',
                    selectable: true,
                    mode: WwxDemo.EditMode.Rectangle,
                    icon: {
                        type: WwxDemo.IconType.Icon,
                        value: 'square'
                    }
                },
                {
                    title: 'setup doors',
                    selectable: true,
                    mode: WwxDemo.EditMode.Doors,
                    icon: {
                        type: WwxDemo.IconType.Div,
                        value: 'door-icon'
                    }
                },
                {
                    title: 'clear workspace',
                    selectable: true,
                    mode: WwxDemo.EditMode.Clear,
                    icon: {
                        type: WwxDemo.IconType.Icon,
                        value: 'trash-o'
                    }
                },
                {
                    title: 'save configuration',
                    selectable: true,
                    mode: WwxDemo.EditMode.Save,
                    icon: {
                        type: WwxDemo.IconType.Icon,
                        value: 'floppy-o'
                    }
                },
                {
                    title: 'load configuration',
                    selectable: true,
                    mode: WwxDemo.EditMode.Open,
                    icon: {
                        type: WwxDemo.IconType.Icon,
                        value: 'folder-open'
                    }
                },
                {
                    title: 'export configuration',
                    selectable: false,
                    mode: WwxDemo.EditMode.Export,
                    icon: {
                        type: WwxDemo.IconType.Icon,
                        value: 'file-text-o'
                    }
                },
                {
                    title: 'hide toolbar',
                    selectable: false,
                    mode: WwxDemo.EditMode.Maximize,
                    icon: {
                        type: WwxDemo.IconType.Icon,
                        value: 'arrows-alt'
                    }
                },
                {
                    title: 'logout',
                    selectable: false,
                    mode: WwxDemo.EditMode.Logout,
                    icon: {
                        type: WwxDemo.IconType.Icon,
                        value: 'sign-out'
                    }
                }
            ];
        }
        ToolbarComponent.prototype.$onChanges = function () {
            var _this = this;
            this.items.forEach(function (i) {
                if (i.mode === _this.currentMode) {
                    i.selected = true;
                }
                else {
                    i.selected = false;
                }
            });
        };
        return ToolbarComponent;
    }());
    angular.module('wwxDemo').component('toolbar', {
        controller: ToolbarComponent,
        bindings: {
            show: '<',
            currentMode: '<',
            onToolSelect: '&'
        },
        template: "\n            <div id=\"left-bar\" ng-show=\"$ctrl.show\">\n                <toolbar-item ng-repeat=\"item in $ctrl.items\" \n                    title=\"item.title\"\n                    selectable=\"item.selectable\"\n                    mode=\"item.mode\"\n                    icon=\"item.icon\"\n                    selected=\"item.selected\"\n                    on-item-clicked=\"$ctrl.onToolSelect({mode:mode})\">\n                </toolbar-item>\n            </div>\n        "
    });
})(WwxDemo || (WwxDemo = {}));
//# sourceMappingURL=toolbar.component.js.map