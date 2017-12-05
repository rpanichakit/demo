var WwxDemo;
(function (WwxDemo) {
    angular.module('wwxDemo', ['ngWebSocket', 'ngTouch'])
        .config(['$locationProvider', function ($locationProvider) {
            $locationProvider.html5Mode({
                requireBase: false,
                enabled: true
            });
        }]);
})(WwxDemo || (WwxDemo = {}));
//# sourceMappingURL=app.js.map