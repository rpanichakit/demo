namespace WwxDemo {
    export class LivePositionsService {
        static $inject = [
            '$http'
        ];
        constructor(
            private $http: ng.IHttpService
        ) {

        }

        getConfigs() {
            return this.$http.get('/api/lidarConfig')
                .then(result => {
                    return result.data;
                })
                .catch(error => {
                    console.log(error);
                });
        }

        insertConfig(config) {
            return this.$http.post('/api/lidarConfig', config)
                .then(result => {
                    return result.data;
                })
                .catch(error => {
                    console.log(error);
                });
        }
    }

    angular.module('wwxDemo')
        .service('livePositionsService', LivePositionsService);
}