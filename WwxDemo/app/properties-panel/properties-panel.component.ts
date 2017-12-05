namespace WwxDemo {
    class PropertiesPanelComponent {
        static $inject = ['configurationsService'];
        constructor(private configurationsService: ConfigurationsService) {
            
        }

        get config() {
            return this.configurationsService.configurations;
        }
    }

    angular.module('wwxDemo')
        .component('propertiesPanel', {
            controller: PropertiesPanelComponent as any,
            bindings: {
                show: '<',
                mode: '<',
                currentZone: '<',
                selectedDevice: '<',
                ruler: '<',
                onUnitIdChanged: '&',
                onScaleChanged: '&',
                onMeasurementChanged: '&',
                onSocketAddressChanged: '&',
                onBoundarySizeChanged: '&'
            },
            template: `
            <div id="left-panel" ng-show="$ctrl.show">
                <div ng-show="$ctrl.mode === 1">
                    <div class="config-row open-title">
                        Settings
                    </div>
                    <div class="config-row"><div class="config-label">sensor</div><select ng-options="unit.id as unit.name for unit in $ctrl.config.unitOptions" ng-model="$ctrl.config.unitId" ng-change="$ctrl.onUnitIdChanged()"></select></div>
                    <div class="config-row"><div class="config-label">scale</div><input type="text" ng-model="$ctrl.config.pixelsPerMeter" ng-model-options="{debounce:500}" ng-change="$ctrl.onScaleChanged()" /></div>
                    <div class="config-row"><div class="config-label">map</div><input type="file" id="map-file" /></div>
                    <div class="config-row"><div class="config-label">unit</div><select ng-model="$ctrl.config.measurementUnit" ng-change="$ctrl.onMeasurementChanged()"><option value="m">meters</option><option value="ft">feet</option></select></div>
                    <div class="config-row"><div >socket</div><input type="text" ng-model="$ctrl.config.socketAddress" ng-model-options="{updateOn:'blur'}" ng-change="$ctrl.onSocketAddressChanged()" style="width: 210px;" /></div>
                    <div class="config-row"><div class="config-label">show zones</div><input type="checkbox" ng-model="$ctrl.showZones" /></div>
                </div>
                <div ng-show="$ctrl.mode === 2">
                    <div class="config-row open-title">
                        Boundary Properties
                    </div>
                    <div class="config-row"><div class="config-label">width</div><input type="text" ng-model="$ctrl.config.boundarywidthMeasurement" ng-change="$ctrl.onBoundarySizeChanged()" ng-model-options={debounce:500} /> <span class="measurement">{{$ctrl.config.measurementUnit}}</span></div>
                    <div class="config-row"><div class="config-label">height</div><input type="text" ng-model="$ctrl.config.boundaryheightMeasurement" ng-change="$ctrl.config.onBoundarySizeChanged()" ng-model-options={debounce:500} /> <span class="measurement">{{$ctrl.config.measurementUnit}}</span></div>
                </div>
                <div ng-show="$ctrl.mode === 6">
                    <div class="config-row open-title">
                        Save Configuration
                    </div>
                    <div class="config-row"><div class="config-label">name</div><input type="text" ng-model="$ctrl.config.configName" /></div>
                    <div class="config-row" style="text-align:right"><button class="save-config-btn" ng-click="$ctrl.saveConfiguration()">save</button> <i class="fa fa-check-circle" aria-hidden="true" style="color:#1da362;" ng-if="$ctrl.showSaveSuccess"></i></div>
                </div>
                <div ng-show="$ctrl.mode === 7">
                    <div class="config-row open-title">
                        Load Configuration
                        <div class="config-src-wrapper">
                            <select ng-model="$ctrl.config.configSource" ng-change="$ctrl.onConfigSourceChange()">
                                <option value="browser">browser</option>
                                <option value="file">file</option>
                            </select>
                        </div>
                    </div>
                    <div class="config-row open-row" ng-click="$ctrl.loadConfiguration(config, true)" ng-repeat="config in $ctrl.savedConfigurations">{{config.name}}<i class="fa fa-folder-open open-icon" aria-hidden="true"></i></div>
                </div>
                <div ng-show="$ctrl.mode === 0 && !$ctrl.currentZone && $ctrl.selectedDevice">
                    <div class="config-row"><div class="config-label">name</div><input type="text" ng-model="$ctrl.selectedDevice.name" /></div>
                </div>
                <div ng-show="$ctrl.mode === 8 && $ctrl.ruler">
                    <div class="config-row"><div class="config-label" style="width:60%;">measurement</div><input style="width:40%;" type="text" ng-model="$ctrl.ruler.measurement" ng-change="$ctrl.onRulerMeasurementChanged()" ng-model-options={debounce:500} /> <span class="measurement">{{$ctrl.unit}}</span></div>
                </div>
                <div ng-show="$ctrl.currentZone">
                    <div class="config-row open-title">
                        Zone Properties
                        <div class="config-src-wrapper">
                            <select ng-model="$ctrl.currentZone.style">
                                <option value="light">light</option>
                                <option value="dark">dark</option>
                            </select>
                        </div>
                    </div>
                    <div class="config-row"><div class="config-label">id</div><input type="text" ng-model="$ctrl.currentZone.id" ng-model-options={debounce:500} /></div>
                    <div class="config-row"><div class="config-label">name</div><input type="text" ng-model="$ctrl.currentZone.name" ng-model-options={debounce:500} /></div>
                    <div class="config-row"><div class="config-label">min dwell</div><input type="text" ng-model="$ctrl.currentZone.minDwell" ng-model-options={debounce:500} /></div>
                    <div class="config-row"><div class="config-label">min pop.</div><input type="text" ng-model="$ctrl.currentZone.minPopulation" ng-model-options={debounce:500} /></div>
                </div>
            </div>
            `
        });
}