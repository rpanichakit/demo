var WwxDemo;
(function (WwxDemo) {
    var viewerComponent = /** @class */ (function () {
        function viewerComponent($location) {
        }
        viewerComponent.prototype.$onInit = function () {
        };
        viewerComponent.$inject = ['$location'];
        return viewerComponent;
    }());
    var module = angular.module('wwxDemo');
    module.component('viewerComponent', {
        controller: viewerComponent,
        template: "<img id=\"map\" \n                            ng-show=\"$ctrl.mapPath\" \n                            ng-src=\"{{$ctrl.mapPath}}\" \n                            ng-dblclick=\"$ctrl.clearMap()\"\n                            ng-style=\"{top:$ctrl.mapPosition.top,left:$ctrl.mapPosition.left}\" />"
    });
})(WwxDemo || (WwxDemo = {}));
//# sourceMappingURL=viewer.component.js.map