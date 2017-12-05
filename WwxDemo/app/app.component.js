var WwxDemo;
(function (WwxDemo) {
    var appComponent = /** @class */ (function () {
        function appComponent($location) {
        }
        appComponent.prototype.$onInit = function () {
        };
        appComponent.$inject = ['$location'];
        return appComponent;
    }());
    var module = angular.module('wwxDemo');
    module.component('viewerComponent', {
        controller: appComponent,
        template: "<live-positions>"
    });
})(WwxDemo || (WwxDemo = {}));
//# sourceMappingURL=app.component.js.map