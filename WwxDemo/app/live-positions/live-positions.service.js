var WwxDemo;
(function (WwxDemo) {
    var LivePositionsService = /** @class */ (function () {
        function LivePositionsService($http) {
            this.$http = $http;
        }
        LivePositionsService.prototype.getConfigs = function () {
            return this.$http.get('/api/lidarConfig')
                .then(function (result) {
                return result.data;
            })
                .catch(function (error) {
                console.log(error);
            });
        };
        LivePositionsService.prototype.insertConfig = function (config) {
            return this.$http.post('/api/lidarConfig', config)
                .then(function (result) {
                return result.data;
            })
                .catch(function (error) {
                console.log(error);
            });
        };
        LivePositionsService.$inject = [
            '$http'
        ];
        return LivePositionsService;
    }());
    WwxDemo.LivePositionsService = LivePositionsService;
    angular.module('wwxDemo')
        .service('livePositionsService', LivePositionsService);
})(WwxDemo || (WwxDemo = {}));
//# sourceMappingURL=live-positions.service.js.map