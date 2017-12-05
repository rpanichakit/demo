namespace WwxDemo {
    class ToolbarComponent {
        private items: ToolBarItem[] = [
            {
                title: 'configuration',
                selectable: true,
                mode: EditMode.Config,
                icon: {
                    type: IconType.Icon,
                    value: 'wrench'
                }
            },
            {
                title: 'ruler',
                selectable: true,
                mode: EditMode.Ruler,
                icon: {
                    type: IconType.Image,
                    value: '/images/ruler.png'
                }
            },
            {
                title: 'setup room boundary',
                selectable: true,
                mode: EditMode.Boundary,
                icon: {
                    type: IconType.Div,
                    value: 'boundary-icon'
                }
            },
            {
                title: 'setup chairs',
                selectable: true,
                mode: EditMode.Chairs,
                icon: {
                    type: IconType.Image,
                    value: '/images/chair.svg'
                }
            },
            {
                title: 'draw zones',
                selectable: true,
                mode: EditMode.Zone,
                icon: {
                    type: IconType.Div,
                    value: 'zone-icon',
                    text: 'z'
                }
            },
            {
                title: 'draw rectangles',
                selectable: true,
                mode: EditMode.Rectangle,
                icon: {
                    type: IconType.Icon,
                    value: 'square'
                }
            },
            {
                title: 'setup doors',
                selectable: true,
                mode: EditMode.Doors,
                icon: {
                    type: IconType.Div,
                    value: 'door-icon'
                }
            },
            {
                title: 'clear workspace',
                selectable: true,
                mode: EditMode.Clear,
                icon: {
                    type: IconType.Icon,
                    value: 'trash-o'
                }
            },
            {
                title: 'save configuration',
                selectable: true,
                mode: EditMode.Save,
                icon: {
                    type: IconType.Icon,
                    value: 'floppy-o'
                }
            },
            {
                title: 'load configuration',
                selectable: true,
                mode: EditMode.Open,
                icon: {
                    type: IconType.Icon,
                    value: 'folder-open'
                }
            },
            {
                title: 'export configuration',
                selectable: false,
                mode: EditMode.Export,
                icon: {
                    type: IconType.Icon,
                    value: 'file-text-o'
                }
            },
            {
                title: 'hide toolbar',
                selectable: false,
                mode: EditMode.Maximize,
                icon: {
                    type: IconType.Icon,
                    value: 'arrows-alt'
                }
            },
            {
                title: 'logout',
                selectable: false,
                mode: EditMode.Logout,
                icon: {
                    type: IconType.Icon,
                    value: 'sign-out'
                }
            }
        ];

        currentMode;

        constructor() {

        }

        $onChanges() {
            this.items.forEach(i => {
                if (i.mode === this.currentMode) {
                    i.selected = true;
                } else {
                    i.selected = false;
                }
            });
        }
    }
    
    angular.module('wwxDemo').component('toolbar', {
        controller: ToolbarComponent as any,
        bindings: {
            show: '<',
            currentMode: '<',
            onToolSelect: '&'
        },
        template: `
            <div id="left-bar" ng-show="$ctrl.show">
                <toolbar-item ng-repeat="item in $ctrl.items" 
                    title="item.title"
                    selectable="item.selectable"
                    mode="item.mode"
                    icon="item.icon"
                    selected="item.selected"
                    on-item-clicked="$ctrl.onToolSelect({mode:mode})">
                </toolbar-item>
            </div>
        `
    });
}