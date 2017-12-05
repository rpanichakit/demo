namespace WwxDemo {
    export class ConfigurationsService {
        configurations = {
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

        savedConfigurations;
    }

    angular.module('wwxDemo')
        .service('configurationService', ConfigurationsService);
}