var WwxDemo;
(function (WwxDemo) {
    var ConfigurationsService = /** @class */ (function () {
        function ConfigurationsService() {
            this.configurations = {
                configName: 'demo1',
                configSource: 'file',
                unitOptions: [
                    { name: 'den replay', id: 8290 },
                    { name: 'traveling demo 1', id: 8303 }
                ],
                unitId: 8303,
                pixelsPerMeter: 6000,
                measurementUnit: 'ft',
                socketAddress: 'wss://microsoftdemo.iinside.com:443/positions',
                showZones: true,
                mapPath: undefined,
                boundaryWidthMeasurement: 0,
                boundaryHeightMeasurement: 0
            };
        }
        return ConfigurationsService;
    }());
    WwxDemo.ConfigurationsService = ConfigurationsService;
    angular.module('wwxDemo')
        .service('configurationService', ConfigurationsService);
})(WwxDemo || (WwxDemo = {}));
//# sourceMappingURL=configurations.service.js.map