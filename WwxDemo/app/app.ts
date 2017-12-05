namespace WwxDemo {
    angular.module('wwxDemo', ['ngWebSocket','ngTouch'])
        .config(['$locationProvider', ($locationProvider) => {
            $locationProvider.html5Mode({
                requireBase: false,
                enabled: true
            });
        }]);
}