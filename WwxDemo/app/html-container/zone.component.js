var WwxDemo;
(function (WwxDemo) {
    var ZoneComponent = /** @class */ (function () {
        function ZoneComponent() {
        }
        return ZoneComponent;
    }());
    angular.module('wwxDemo')
        .component('zone', {
        controller: ZoneComponent,
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
        template: "\n            <div class=\"rectangle\"\n                 ng-show=\"$ctrl.show\"\n                 ng-class=\"$ctrl.classes\"\n                 ng-style=\"$ctrl.styles\"\n                 ng-dblclick=\"$ctrl.dblClick({index:$index,event:$event})\"\n                 ng-click=\"$ctrl.click({event:$event,zone:$ctrl})\"\n                 ng-mousedown=\"$ctrl.mouseDown({event:$event,zone:$ctrl})\">\n                <div class=\"boundary-labels\" ng-style=\"{height:r.height+'px'}\">\n                    <div ng-show=\"$ctrl.mode !== 0 || r.selected\">\n                        <div class=\"boundary-width-label\">{{r.widthMeasurement}} {{$ctrl.unit}}</div>\n                        <div class=\"boundary-height-label\">{{r.heightMeasurement}} {{$ctrl.unit}}</div>\n                        <div ng-show=\"r.selected\" class=\"rect-handles {{handle.class}}\" ng-style=\"{top:handle.top+'px',left:handle.left+'px'}\" ng-repeat=\"handle in r.handles\" ng-mousedown=\"$ctrl.handleMouseDown(handle,$event)\" ng-mouseup=\"$ctrl.handleMouseUp(handle,$event)\" ng-mousemove=\"$ctrl.handleMouseMove(handle, $event)\"></div>\n                    </div>\n                    <div class=\"zone-name-label\">{{r.name}}</div>\n                </div>\n            </div>\n            "
    });
})(WwxDemo || (WwxDemo = {}));
//# sourceMappingURL=zone.component.js.map