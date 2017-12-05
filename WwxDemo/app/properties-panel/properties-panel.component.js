var WwxDemo;
(function (WwxDemo) {
    var PropertiesPanelComponent = /** @class */ (function () {
        function PropertiesPanelComponent(configurationsService) {
            this.configurationsService = configurationsService;
        }
        Object.defineProperty(PropertiesPanelComponent.prototype, "config", {
            get: function () {
                return this.configurationsService.configurations;
            },
            enumerable: true,
            configurable: true
        });
        PropertiesPanelComponent.$inject = ['configurationsService'];
        return PropertiesPanelComponent;
    }());
    angular.module('wwxDemo')
        .component('propertiesPanel', {
        controller: PropertiesPanelComponent,
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
        template: "\n            <div id=\"left-panel\" ng-show=\"$ctrl.show\">\n                <div ng-show=\"$ctrl.mode === 1\">\n                    <div class=\"config-row open-title\">\n                        Settings\n                    </div>\n                    <div class=\"config-row\"><div class=\"config-label\">sensor</div><select ng-options=\"unit.id as unit.name for unit in $ctrl.config.unitOptions\" ng-model=\"$ctrl.config.unitId\" ng-change=\"$ctrl.onUnitIdChanged()\"></select></div>\n                    <div class=\"config-row\"><div class=\"config-label\">scale</div><input type=\"text\" ng-model=\"$ctrl.config.pixelsPerMeter\" ng-model-options=\"{debounce:500}\" ng-change=\"$ctrl.onScaleChanged()\" /></div>\n                    <div class=\"config-row\"><div class=\"config-label\">map</div><input type=\"file\" id=\"map-file\" /></div>\n                    <div class=\"config-row\"><div class=\"config-label\">unit</div><select ng-model=\"$ctrl.config.measurementUnit\" ng-change=\"$ctrl.onMeasurementChanged()\"><option value=\"m\">meters</option><option value=\"ft\">feet</option></select></div>\n                    <div class=\"config-row\"><div >socket</div><input type=\"text\" ng-model=\"$ctrl.config.socketAddress\" ng-model-options=\"{updateOn:'blur'}\" ng-change=\"$ctrl.onSocketAddressChanged()\" style=\"width: 210px;\" /></div>\n                    <div class=\"config-row\"><div class=\"config-label\">show zones</div><input type=\"checkbox\" ng-model=\"$ctrl.showZones\" /></div>\n                </div>\n                <div ng-show=\"$ctrl.mode === 2\">\n                    <div class=\"config-row open-title\">\n                        Boundary Properties\n                    </div>\n                    <div class=\"config-row\"><div class=\"config-label\">width</div><input type=\"text\" ng-model=\"$ctrl.config.boundarywidthMeasurement\" ng-change=\"$ctrl.onBoundarySizeChanged()\" ng-model-options={debounce:500} /> <span class=\"measurement\">{{$ctrl.config.measurementUnit}}</span></div>\n                    <div class=\"config-row\"><div class=\"config-label\">height</div><input type=\"text\" ng-model=\"$ctrl.config.boundaryheightMeasurement\" ng-change=\"$ctrl.config.onBoundarySizeChanged()\" ng-model-options={debounce:500} /> <span class=\"measurement\">{{$ctrl.config.measurementUnit}}</span></div>\n                </div>\n                <div ng-show=\"$ctrl.mode === 6\">\n                    <div class=\"config-row open-title\">\n                        Save Configuration\n                    </div>\n                    <div class=\"config-row\"><div class=\"config-label\">name</div><input type=\"text\" ng-model=\"$ctrl.config.configName\" /></div>\n                    <div class=\"config-row\" style=\"text-align:right\"><button class=\"save-config-btn\" ng-click=\"$ctrl.saveConfiguration()\">save</button> <i class=\"fa fa-check-circle\" aria-hidden=\"true\" style=\"color:#1da362;\" ng-if=\"$ctrl.showSaveSuccess\"></i></div>\n                </div>\n                <div ng-show=\"$ctrl.mode === 7\">\n                    <div class=\"config-row open-title\">\n                        Load Configuration\n                        <div class=\"config-src-wrapper\">\n                            <select ng-model=\"$ctrl.config.configSource\" ng-change=\"$ctrl.onConfigSourceChange()\">\n                                <option value=\"browser\">browser</option>\n                                <option value=\"file\">file</option>\n                            </select>\n                        </div>\n                    </div>\n                    <div class=\"config-row open-row\" ng-click=\"$ctrl.loadConfiguration(config, true)\" ng-repeat=\"config in $ctrl.savedConfigurations\">{{config.name}}<i class=\"fa fa-folder-open open-icon\" aria-hidden=\"true\"></i></div>\n                </div>\n                <div ng-show=\"$ctrl.mode === 0 && !$ctrl.currentZone && $ctrl.selectedDevice\">\n                    <div class=\"config-row\"><div class=\"config-label\">name</div><input type=\"text\" ng-model=\"$ctrl.selectedDevice.name\" /></div>\n                </div>\n                <div ng-show=\"$ctrl.mode === 8 && $ctrl.ruler\">\n                    <div class=\"config-row\"><div class=\"config-label\" style=\"width:60%;\">measurement</div><input style=\"width:40%;\" type=\"text\" ng-model=\"$ctrl.ruler.measurement\" ng-change=\"$ctrl.onRulerMeasurementChanged()\" ng-model-options={debounce:500} /> <span class=\"measurement\">{{$ctrl.unit}}</span></div>\n                </div>\n                <div ng-show=\"$ctrl.currentZone\">\n                    <div class=\"config-row open-title\">\n                        Zone Properties\n                        <div class=\"config-src-wrapper\">\n                            <select ng-model=\"$ctrl.currentZone.style\">\n                                <option value=\"light\">light</option>\n                                <option value=\"dark\">dark</option>\n                            </select>\n                        </div>\n                    </div>\n                    <div class=\"config-row\"><div class=\"config-label\">id</div><input type=\"text\" ng-model=\"$ctrl.currentZone.id\" ng-model-options={debounce:500} /></div>\n                    <div class=\"config-row\"><div class=\"config-label\">name</div><input type=\"text\" ng-model=\"$ctrl.currentZone.name\" ng-model-options={debounce:500} /></div>\n                    <div class=\"config-row\"><div class=\"config-label\">min dwell</div><input type=\"text\" ng-model=\"$ctrl.currentZone.minDwell\" ng-model-options={debounce:500} /></div>\n                    <div class=\"config-row\"><div class=\"config-label\">min pop.</div><input type=\"text\" ng-model=\"$ctrl.currentZone.minPopulation\" ng-model-options={debounce:500} /></div>\n                </div>\n            </div>\n            "
    });
})(WwxDemo || (WwxDemo = {}));
//# sourceMappingURL=properties-panel.component.js.map