namespace WwxDemo {
    class ZoneComponent {

    }

    angular.module('wwxDemo')
        .component('zone', {
            controller: ZoneComponent as any,
            bindings: {
                show: '<',
                classes: '<',
                styles: '<',
                unit: '<',
                widthMeasurement: '<',
                heightMeasurement: '<',
                name: '<',
                selected: '<',
                dblClick: '&',
                click: '&',
                mouseDown: '&'
            },
            template: `
            <div class="rectangle"
                 ng-show="$ctrl.show"
                 ng-class="$ctrl.classes"
                 ng-style="$ctrl.styles"
                 ng-dblclick="$ctrl.dblClick({index:$index,event:$event})"
                 ng-click="$ctrl.click({event:$event,zone:$ctrl})"
                 ng-mousedown="$ctrl.mouseDown({event:$event,zone:$ctrl})">
                <div class="boundary-labels" ng-style="{height:r.height+'px'}">
                    <div ng-show="$ctrl.mode !== 0 || r.selected">
                        <div class="boundary-width-label">{{r.widthMeasurement}} {{$ctrl.unit}}</div>
                        <div class="boundary-height-label">{{r.heightMeasurement}} {{$ctrl.unit}}</div>
                        <div ng-show="r.selected" class="rect-handles {{handle.class}}" ng-style="{top:handle.top+'px',left:handle.left+'px'}" ng-repeat="handle in r.handles" ng-mousedown="$ctrl.handleMouseDown(handle,$event)" ng-mouseup="$ctrl.handleMouseUp(handle,$event)" ng-mousemove="$ctrl.handleMouseMove(handle, $event)"></div>
                    </div>
                    <div class="zone-name-label">{{r.name}}</div>
                </div>
            </div>
            `
        });
}