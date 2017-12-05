var WwxDemo;
(function (WwxDemo) {
    var LivePositionsComponent = /** @class */ (function () {
        function LivePositionsComponent($websocket, $timeout, $scope, service, $document, $location, $window) {
            this.$websocket = $websocket;
            this.$timeout = $timeout;
            this.$scope = $scope;
            this.service = service;
            this.$document = $document;
            this.$location = $location;
            this.$window = $window;
            this.feetPerMeter = 3.28;
            this.positionOutputs = [];
            this.deviceInfo = [];
            this.mapPosition = { top: 0, left: 0 };
            this.defaultTransform = 'rotate(0rad)';
            this.sensorTransform = 'rotate(0rad)';
            this.hasSensorRotate = true;
            this.currentAngle = 0;
            this.currentRad = 0;
            this.pixelsPerMeter = 6000;
            this.unitId = 8290;
            this.radianStep = 0.00872665;
            this.degreeStep = 0.5;
            this.radiansPerDegree = 0.0174533;
            this.scaleStep = 1;
            this.unit = 'ft';
            this.dotSize = 3;
            this.unitOptions = [
                { name: 'den replay', id: 8290 },
                { name: 'traveling demo 1', id: 8303 }
            ];
            this.mode = WwxDemo.EditMode.None;
            this.boundaryWidth = 0;
            this.boundaryHeight = 0;
            this.boundaries = [];
            this.boundwidthMeasurement = 0;
            this.boundheightMeasurement = 0;
            this.chairs = [];
            this.doors = [];
            this.dragging = false;
            this.zones = [];
            this.rectangles = [];
            this.savedConfigurations = [];
            this.configName = '';
            this.configId = 0;
            this.showSaveSuccess = false;
            this.localStorageKey = 'iinsideConfigurations';
            this.namedIds = [];
            this.measuring = false;
            this.configSource = 'file';
            this.mousePosition = {};
            this.undoStack = [];
            this.undoIndex = 0;
            this.showZones = true;
            this.hasDatabase = true;
            this.preTranslated = false;
            this.editingZone = false;
            this.resizingBoundary = false;
            // private socketAddress = 'ws://192.168.101.26:9393/positions';
            this.socketAddress = 'wss://microsoftdemo.iinside.com:443/positions';
            this.hideMenu = false;
            this.shouldSubscribeToZones = false;
            this.draggingCanvas = false;
            this.autoScale = true;
            this.autoPosition = true;
            this.zoomScale = 1;
            this.zoomOrigin = '50% 50%';
            this.viewScale = 1;
            this.viewZoomOrigin = '50% 50%';
            this.lockSensorScale = false;
            this.lockSensorRotate = false;
            this.drawMode = 'canvas';
            this.glowDuration = 800;
            this.EditMode = WwxDemo.EditMode;
            this.init();
        }
        Object.defineProperty(LivePositionsComponent.prototype, "showConfig", {
            get: function () {
                return this.mode === WwxDemo.EditMode.Config || this.mode === WwxDemo.EditMode.Map || this.mode === WwxDemo.EditMode.Boundary || (this.currentZone) || this.mode === WwxDemo.EditMode.Save || this.mode === WwxDemo.EditMode.Open || this.mode === WwxDemo.EditMode.Ruler;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LivePositionsComponent.prototype, "graphColors", {
            get: function () {
                return [
                    '#3399FF',
                    '#33CC99',
                    '#931FFF',
                    '#FF8C04',
                    '#FF3333',
                    '#33CCFF',
                    '#33FF66',
                    '#AD55FF',
                    '#EAB000',
                    '#FF6666',
                    '#4169E1',
                    '#00AD00',
                    '#6502D4',
                    '#DB8334',
                    '#CC0000',
                    '#95CDF0',
                    '#70E828',
                    '#A56FFF',
                    '#FFD200',
                    '#FF9999',
                    '#F0F8FF',
                    '#BAFF91',
                    '#EF8FFF',
                    '#FFF071',
                    '#FFCCCC',
                    '#003399',
                    '#006F05',
                    '#5E338E',
                    '#A85003',
                    '#A70000'
                ];
            },
            enumerable: true,
            configurable: true
        });
        LivePositionsComponent.prototype.bindKeys = function () {
            var _this = this;
            this.$document.on('keydown', function (e) {
                _this.$scope.$apply(function () {
                    if (e.target.tagName !== 'INPUT') {
                        if (e.ctrlKey) {
                            switch (e.key) {
                                case 'c':
                                    if (_this.currentZone) {
                                        _this.copiedZone = angular.copy(_this.currentZone);
                                    }
                                    break;
                                case 'v':
                                    if (_this.copiedZone) {
                                        _this.storeUndo();
                                        var newZone = angular.copy(_this.copiedZone);
                                        newZone.id = 'z' + (_this.zones.length + 1);
                                        newZone.name = 'zone ' + (_this.zones.length + 1);
                                        newZone.top = _this.mousePosition.y;
                                        newZone.left = _this.mousePosition.x;
                                        newZone.selected = false;
                                        _this.zones.push(newZone);
                                        _this.$timeout(function () {
                                            _this.bindZones();
                                        }, 100);
                                    }
                                    break;
                                case 'z':
                                    _this.undo();
                                    break;
                            }
                        }
                        if (_this.mode === WwxDemo.EditMode.Config) {
                            _this.radianStep = _this.degreeStep * _this.radiansPerDegree;
                            var scaleStep = _this.scaleStep * 100;
                            switch (e.key) {
                                case 'ArrowUp':
                                    _this.changePixelsPerMeter(_this.pixelsPerMeter + scaleStep);
                                    break;
                                case 'ArrowDown':
                                    _this.changePixelsPerMeter(_this.pixelsPerMeter - scaleStep);
                                    break;
                                case 'ArrowLeft':
                                    _this.currentRad -= _this.radianStep;
                                    _this.currentAngle = _this.getDegreesFromRadians(_this.currentRad);
                                    _this.sensorTransform = 'rotate(' + (_this.currentRad * 180) / Math.PI + 'deg)';
                                    break;
                                case 'ArrowRight':
                                    _this.currentRad += _this.radianStep;
                                    _this.currentAngle = _this.getDegreesFromRadians(_this.currentRad);
                                    _this.sensorTransform = 'rotate(' + (_this.currentRad * 180) / Math.PI + 'deg)';
                                    break;
                            }
                        }
                    }
                });
            });
        };
        LivePositionsComponent.prototype.createGlow = function () {
            var _this = this;
            var filter = this.defs
                .append('filter')
                .attr('height', '350%')
                .attr('width', '350%')
                .attr('x', '-100%')
                .attr('y', '-100%')
                .attr('id', 'glow');
            var stdDev = 6;
            var blur = filter
                .append("feGaussianBlur")
                .attr("class", "blur")
                .attr("stdDeviation", stdDev)
                .attr("result", "coloredBlur");
            var feMerge = filter.append("feMerge");
            feMerge
                .append("feMergeNode")
                .attr("in", "coloredBlur");
            feMerge
                .append("feMergeNode")
                .attr("in", "SourceGraphic");
            var blink = function () {
                if (stdDev == 6)
                    stdDev = 3;
                else
                    stdDev = 6;
                blur.transition()
                    .duration(_this.glowDuration)
                    .attr('stdDeviation', stdDev)
                    .each('end', blink);
            };
            blink();
        };
        LivePositionsComponent.prototype.touchHandler = function (event) {
            var touch = event.changedTouches[0];
            var simulatedEvent = document.createEvent("MouseEvent");
            simulatedEvent.initMouseEvent({
                touchstart: "mousedown",
                touchmove: "mousemove",
                touchend: "mouseup"
            }[event.type], true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
            touch.target.dispatchEvent(simulatedEvent);
            //event.preventDefault();
        };
        LivePositionsComponent.prototype.onAutoScaleChanged = function () {
            if (!this.autoScale) {
                var left = Math.round((this.canvasWidth / 2) - ($('#map').width() / 2)) + 'px';
                this.mapPosition = {
                    top: '50px',
                    left: left
                };
                $('#map').draggable('option', 'disabled', false);
            }
            else {
                this.mapPosition = {
                    top: '50%',
                    left: '50%'
                };
                $('#map').draggable('option', 'disabled', true);
            }
        };
        LivePositionsComponent.prototype.repositionItemWithinBoundary = function (item, ratio, origBoundary) {
            var boundaryLeft = (item.left - origBoundary.left) * ratio;
            var boundaryTop = (item.top - origBoundary.top) * ratio;
            item.left = this.boundary.left + boundaryLeft;
            item.top = this.boundary.top + boundaryTop;
        };
        LivePositionsComponent.prototype.onWindowResize = function () {
            var _this = this;
            this.canvasWidth = $('#canvas-container').width();
            this.canvasHeight = $('#canvas-container').height();
            if (this.autoScale && !this.mapOrigins && this.boundary) {
                var origBoundary_1 = angular.copy(this.boundary);
                this.sizeBoundary();
                var ratio_1 = this.boundary.width / origBoundary_1.width;
                this.repositionItemWithinBoundary(this.sensorPosition, ratio_1, origBoundary_1);
                this.zones.forEach(function (z) {
                    _this.repositionItemWithinBoundary(z, ratio_1, origBoundary_1);
                });
                this.chairs.forEach(function (c) {
                    _this.repositionItemWithinBoundary(c, ratio_1, origBoundary_1);
                });
                this.doors.forEach(function (d) {
                    _this.repositionItemWithinBoundary(d, ratio_1, origBoundary_1);
                });
                this.rectangles.forEach(function (r) {
                    _this.repositionItemWithinBoundary(r, ratio_1, origBoundary_1);
                });
                this.$timeout(function () {
                    _this.updateSensorRays();
                }, 100);
            }
            else if (this.mapOrigins && this.autoScale) {
                var map = angular.element('#map');
                var newPos_1 = map.position();
                newPos_1.top = newPos_1.top / this.zoomScale;
                newPos_1.left = newPos_1.left / this.zoomScale;
                var newWidth = map.width();
                var newHeight = map.height();
                var widthRatio_1 = newWidth / this.mapOrigins.width;
                var heightRatio = newHeight / this.mapOrigins.height;
                var mapPosLeft = (this.sensorPosition.left - this.mapOrigins.position.left) * widthRatio_1;
                var mapPosTop = (this.sensorPosition.top - this.mapOrigins.position.top) * heightRatio;
                this.sensorPosition.left = newPos_1.left + mapPosLeft;
                this.sensorPosition.top = newPos_1.top + mapPosTop;
                if (this.boundary) {
                    this.repositionItem(this.boundary, widthRatio_1, newPos_1);
                }
                this.zones.forEach(function (z) {
                    _this.repositionItem(z, widthRatio_1, newPos_1);
                });
                this.chairs.forEach(function (c) {
                    _this.repositionItem(c, widthRatio_1, newPos_1);
                });
                this.doors.forEach(function (d) {
                    _this.repositionItem(d, widthRatio_1, newPos_1);
                });
                this.rectangles.forEach(function (r) {
                    _this.repositionItem(r, widthRatio_1, newPos_1);
                });
                //this.pixelsPerMeter = this.pixelsPerMeter * widthRatio;
                this.changePixelsPerMeter(this.pixelsPerMeter * widthRatio_1);
                //this.sensorPosition.top *= heightRatio;
                //this.sensorPosition.left *= widthRatio;
                this.mapOrigins = {
                    position: newPos_1,
                    width: newWidth,
                    height: newHeight
                };
                this.updateSensorRays();
            }
        };
        LivePositionsComponent.prototype.init = function () {
            var _this = this;
            document.addEventListener("touchstart", this.touchHandler, true);
            document.addEventListener("touchmove", this.touchHandler, true);
            document.addEventListener("touchend", this.touchHandler, true);
            document.addEventListener("touchcancel", this.touchHandler, true);
            angular.element(this.$window).on('resize', function (e) {
                _this.onWindowResize();
            });
            this.bindKeys();
            var configurationData = localStorage.getItem(this.localStorageKey);
            this.savedConfigurations = configurationData ? JSON.parse(configurationData) : [];
            this.configName = 'demo_' + (this.savedConfigurations.length + 1);
            var canvas = document.getElementById('dots-canvas');
            this.canvasWidth = $('#canvas-container').width();
            this.canvasHeight = $('#canvas-container').height();
            this.canvasContext = canvas.getContext('2d');
            this.sensorPosition = $('#sensor').position();
            this.svgElement = d3.select(document.getElementById('svg-wrapper'))
                .append('svg')
                .attr('width', this.canvasWidth)
                .attr('height', this.canvasHeight);
            this.defs = this.svgElement.append('defs');
            this.createGlow();
            this.circlesG = this.svgElement
                .append('g')
                .style('filter', 'url(#glow)');
            //$(window).on('resize', () => {
            //    this.$scope.$apply(() => {
            //        this.canvasWidth = $('#canvas-container').width();
            //        this.canvasHeight = $('#canvas-container').height();
            //    });
            //});
            this.$timeout(function () {
                var map = $('#map');
                map.on('mousewheel', function (e) {
                    if (_this.mode === WwxDemo.EditMode.Map && !_this.autoScale) {
                        _this.$scope.$apply(function () {
                            if (e.originalEvent.wheelDelta / 120 > 0) {
                                map.width(map.width() * 1.1);
                                map.height(map.height() * 1.1);
                            }
                            else {
                                map.width(map.width() * .9);
                                map.height(map.height() * .9);
                            }
                        });
                    }
                });
                $('#canvas-container').on('mousewheel', function (e) {
                    if (_this.hideMenu === true) {
                        _this.$scope.$apply(function () {
                            if (e.originalEvent.wheelDelta / 120 > 0) {
                                _this.zoomOrigin = e.clientX + 'px ' + e.clientY + 'px';
                                _this.zoomScale += .2;
                            }
                            else {
                                if (_this.zoomScale > .2) {
                                    _this.zoomScale -= .2;
                                }
                            }
                            _this.$timeout(function () {
                                _this.mapOrigins = {
                                    position: {
                                        top: $('#map').position().top / _this.zoomScale,
                                        left: $('#map').position().left / _this.zoomScale
                                    },
                                    width: $('#map').width(),
                                    height: $('#map').height()
                                };
                            }, 10);
                        });
                    }
                });
                map.draggable({
                    delay: 200,
                    draggable: _this.mode === WwxDemo.EditMode.Config,
                    start: function (event, ui) {
                        _this.draggableStartAdjust(ui);
                    },
                    drag: function (event, ui) {
                        _this.draggableDragAdjust(ui);
                        var topDiff = ui.position.top - _this.mapPosition.top;
                        var leftDiff = ui.position.left - _this.mapPosition.left;
                        _this.mapPosition = ui.position;
                        if (!isNaN(topDiff) && !isNaN(leftDiff)) {
                            _this.$scope.$apply(function () {
                                if (!event.ctrlKey) {
                                    _this.sensorPosition.top += topDiff;
                                    _this.sensorPosition.left += leftDiff;
                                    _this.zones.forEach(function (r) {
                                        r.top += topDiff;
                                        r.left += leftDiff;
                                    });
                                    _this.chairs.forEach(function (c) {
                                        c.top += topDiff;
                                        c.left += leftDiff;
                                    });
                                    _this.doors.forEach(function (d) {
                                        d.top += topDiff;
                                        d.left += leftDiff;
                                    });
                                    _this.rectangles.forEach(function (r) {
                                        r.top += topDiff;
                                        r.left += leftDiff;
                                    });
                                }
                                _this.updateSensorRays();
                            });
                        }
                    }
                });
                if (_this.autoScale) {
                    $('#map').draggable('option', 'disabled', true);
                }
                var boundary = $('.room-boundary');
                boundary.draggable({
                    //containment: '#canvas-container',
                    delay: 200,
                    start: function (event, ui) {
                        _this.draggableStartAdjust(ui);
                    },
                    drag: function (event, ui) {
                        _this.draggableDragAdjust(ui);
                        var topDiff = ui.position.top - _this.boundary.top;
                        var leftDiff = ui.position.left - _this.boundary.left;
                        if (!isNaN(topDiff) && !isNaN(leftDiff)) {
                            _this.$scope.$apply(function () {
                                if (!event.ctrlKey) {
                                    _this.sensorPosition.top += topDiff;
                                    _this.sensorPosition.left += leftDiff;
                                    _this.zones.forEach(function (r) {
                                        r.top += topDiff;
                                        r.left += leftDiff;
                                    });
                                    _this.chairs.forEach(function (c) {
                                        c.top += topDiff;
                                        c.left += leftDiff;
                                    });
                                    _this.doors.forEach(function (d) {
                                        d.top += topDiff;
                                        d.left += leftDiff;
                                    });
                                    _this.rectangles.forEach(function (r) {
                                        r.top += topDiff;
                                        r.left += leftDiff;
                                    });
                                }
                                _this.boundary.top = ui.position.top;
                                _this.boundary.left = ui.position.left;
                                _this.updateSensorRays();
                            });
                        }
                    },
                    stop: function (event, ui) {
                    }
                });
                var sensor = $('#sensor');
                sensor.draggable({
                    //containment: '#canvas-container',
                    delay: 100,
                    start: function (event, ui) {
                        _this.draggableStartAdjust(ui);
                        event.stopPropagation();
                    },
                    drag: function (event, ui) {
                        event.stopPropagation();
                        _this.draggableDragAdjust(ui);
                        _this.$scope.$apply(function () {
                            _this.sensorPosition = ui.position;
                            _this.updateSensorRays();
                        });
                    },
                    stop: function (event, ui) {
                        event.stopPropagation();
                        _this.$scope.$apply(function () {
                            _this.sensorPosition = ui.position;
                            _this.updateSensorRays();
                        });
                    }
                });
                //let rotate: any = $('#rotate');
                //rotate.rotatable({
                //    rotate: (event, ui) => {
                //        //console.log(ui);
                //        this.currentAngle = ui.angle.degrees;
                //        this.currentRad = ui.angle.current;
                //    }
                //});
                $('#map-file').on('change', function () {
                    var inputFile = document.getElementById('map-file');
                    if (inputFile.files && inputFile.files[0]) {
                        var reader = new FileReader();
                        reader.onload = function (e) {
                            _this.$scope.$apply(function () {
                                _this.mapPath = e.target.result;
                                _this.$timeout(function () {
                                    var left = Math.round((_this.canvasWidth / 2) - ($('#map').width() / 2)) + 'px';
                                    if (_this.autoScale) {
                                        _this.mapPosition = {
                                            top: '50%',
                                            left: '50%'
                                        };
                                    }
                                    else {
                                        _this.mapPosition = {
                                            top: '50px',
                                            left: left
                                        };
                                    }
                                    $('#map').css('top', _this.mapPosition.top);
                                    $('#map').css('left', _this.mapPosition.left);
                                    if (_this.autoScale) {
                                        _this.mapOrigins = {
                                            position: $('#map').position(),
                                            width: $('#map').width(),
                                            height: $('#map').height()
                                        };
                                    }
                                }, 10);
                            });
                        };
                        reader.readAsDataURL(inputFile.files[0]);
                    }
                });
            }, 100);
            var configName = this.$location.search().config;
            var view = this.$location.search().view;
            if (configName) {
                this.service.getConfigs()
                    .then(function (configs) {
                    _this.savedConfigurations = configs.map(function (c) {
                        var data = c.data ? JSON.parse(c.data) : {};
                        data.configId = c.id;
                        return data;
                    });
                    var foundConfig = false;
                    _this.savedConfigurations.forEach(function (c) {
                        if (c.name === configName) {
                            _this.loadConfiguration(c);
                            foundConfig = true;
                        }
                    });
                    if (!foundConfig) {
                        _this.connectToWebSocket();
                    }
                });
            }
            else {
                this.connectToWebSocket();
            }
            if (view) {
                this.mode = WwxDemo.EditMode.None;
                this.hideMenu = true;
            }
        };
        LivePositionsComponent.prototype.draggableStartAdjust = function (ui) {
            //ui.position.left = 0;
            //ui.position.top = 0;
        };
        LivePositionsComponent.prototype.draggableDragAdjust = function (ui) {
            //var changeLeft = ui.position.left - ui.originalPosition.left; // find change in left
            //var newLeft = ui.originalPosition.left + changeLeft / ((this.zoomScale)); // adjust new left by our zoomScale
            //var changeTop = ui.position.top - ui.originalPosition.top; // find change in top
            //var newTop = ui.originalPosition.top + changeTop / this.zoomScale; // adjust new top by our zoomScale
            //ui.position.left = newLeft;
            //ui.position.top = newTop;
        };
        LivePositionsComponent.prototype.logout = function () {
            window.location.href = '/AuthServices/Logout';
        };
        LivePositionsComponent.prototype.rotateByRad = function (origin, point, radians) {
            var cos = Math.cos(radians), sin = Math.sin(radians), dX = point.x - origin.x, dY = point.y - origin.y;
            return {
                x: cos * dX - sin * dY + origin.x,
                y: sin * dX + cos * dY + origin.y
            };
        };
        LivePositionsComponent.prototype.rotateByDegrees = function (origin, point, angle) {
            var radians = angle * Math.PI / 180.0;
            return this.rotateByRad(origin, point, radians);
        };
        LivePositionsComponent.prototype.subscribeToZonesAnalysis = function () {
            if (this.zStream) {
                this.zStream.send('zsub ' + this.configName);
            }
        };
        LivePositionsComponent.prototype.connectToWebSocket = function () {
            var _this = this;
            if (this.dataStream) {
                this.dataStream.close();
            }
            if (this.zStream) {
                this.zStream.close();
            }
            if (this.zextStream) {
                this.zextStream.close();
            }
            // const wsUrl = 'wss://iisanalytics.iinside.com:9393/positions';
            // const wsUrl = 'ws://192.168.101.26:9393/positions';
            this.dataStream = this.$websocket(this.socketAddress, null, { reconnectIfNotNormalClose: true });
            this.zStream = this.$websocket(this.socketAddress, null, { reconnectIfNotNormalClose: true });
            this.zextStream = this.$websocket(this.socketAddress, null, { reconnectIfNotNormalClose: true });
            this.zextStream.onOpen(function () {
                // console.log('connected zextsub');
                _this.zextStream.send('zextsub');
            });
            this.zextStream.onError(function (err) {
                console.log(err);
            });
            this.zextStream.onMessage(function (message) {
                var data = JSON.parse(message.data);
                // console.log(data);
                //this.rectangles.forEach(r => {
                //    const zoneInData = data.filter(d => d.ZoneId === r.id)[0];
                //    if (!zoneInData) {
                //        r.population = 0;
                //        r.occupied = false;
                //    }
                //});
                data.forEach(function (z) {
                    //this.rectangles.forEach(r => {
                    //    if (z.ZoneId === r.id) {
                    //        r.population = z.ZoneVisits.length;
                    //        r.occupied = z.ZoneVisits.length > 0;
                    //    }
                    //});
                    //z.ZoneVisits.forEach(v => {
                    //    if (this.positionOutputs) {
                    //        this.positionOutputs.forEach(o => {
                    //            if (o.deviceId === v.ID) {
                    //                const zone = this.rectangles.filter(r => r.id === z.ZoneId)[0];
                    //                if (zone) {
                    //                    o.name = zone.name;
                    //                } else {
                    //                    o.name = z.ZoneId;
                    //                }
                    //                let existing = this.namedIds.filter((n) => {
                    //                    return n.id === o.deviceId;
                    //                })[0];
                    //                if (!existing) {
                    //                    this.namedIds.push({
                    //                        id: o.deviceId,
                    //                        name: o.name
                    //                    });
                    //                }
                    //                else {
                    //                    existing.name = o.name;
                    //                    this.selectedDevice = existing;
                    //                }
                    //            }
                    //        });
                    //    }
                    //});
                });
                //this.positionOutputs.forEach(p => {
                //    let stillInZone = false;
                //    data.forEach(z => {
                //        let inAZone = z.ZoneVisits.filter(v => v.ID === p.deviceId)[0];
                //        if (inAZone) {
                //            stillInZone = true;
                //        }
                //    });
                //    if (!stillInZone) {
                //        p.name = false;
                //        let existing = this.namedIds.filter((n) => {
                //            return n.id === p.deviceId;
                //        })[0];
                //        if (existing) {
                //            existing.name = false;
                //        }
                //    }
                //});
            });
            this.zStream.onOpen(function () {
                console.log('connected zsub');
                if (_this.shouldSubscribeToZones) {
                    _this.subscribeToZonesAnalysis();
                }
            });
            this.zStream.onError(function (err) {
                console.log(err);
            });
            this.zStream.onMessage(function (message) {
                var data = JSON.parse(message.data);
                // console.log(data);
                _this.zones.forEach(function (r) {
                    if (r.id === data.zoneId) {
                        r.occupied = data.status;
                        r.population = data.countExceedingDwell;
                        if (r.occupied) {
                            // console.log(data.ZoneId + ' is occupied.');
                        }
                    }
                });
            });
            this.dataStream.onOpen(function () {
                if (_this.preTranslated) {
                    console.log('connected jsub');
                    _this.dataStream.send('jsub office_lidar');
                }
                else {
                    console.log('connected SUB');
                    _this.dataStream.send('SUB ' + _this.unitId);
                }
            });
            this.dataStream.onClose(function (event) {
                console.log(event);
            });
            this.dataStream.onError(function (err) {
                console.log(err);
            });
            this.dataStream.onMessage(function (message) {
                var reader = new FileReader();
                reader.onload = function (evt) {
                    var dv = new DataView(reader.result);
                    var retVal = "";
                    _this.positionOutputs = [];
                    for (var i = 0; i < dv.byteLength / 6; i++) {
                        var j = i * 6;
                        var x = void 0, y = void 0;
                        if (!_this.preTranslated) {
                            //console.log('x:' + dv.getInt16(j + 2, true) + ',y:' + dv.getInt16(j + 4, true));
                            x = Math.round(((dv.getInt16(j + 2, true) / 100) * (_this.pixelsPerMeter / 100)) + _this.sensorPosition.left);
                            y = Math.round(((dv.getInt16(j + 4, true) / 100) * (_this.pixelsPerMeter / 100)) + _this.sensorPosition.top);
                        }
                        else {
                            x = dv.getInt16(j + 2, true);
                            y = dv.getInt16(j + 4, true);
                        }
                        var output = {
                            deviceId: dv.getUint16(j, true),
                            x: x,
                            y: y,
                            xCentimeters: dv.getInt16(j + 2, true),
                            yCentimeters: dv.getInt16(j + 4, true),
                            color: _this.getColorByDeviceId(dv.getUint16(j, true)),
                            name: false
                        };
                        if (!_this.preTranslated) {
                            var origin = {
                                x: _this.sensorPosition.left,
                                y: _this.sensorPosition.top
                            };
                            var newPoint = _this.rotateByRad(origin, output, _this.currentRad);
                            output.x = newPoint.x;
                            output.y = newPoint.y;
                        }
                        //let existingName = this.namedIds.filter((n) => { return n.id === output.deviceId; })[0];
                        //if (existingName) {
                        //    output.name = existingName.name;
                        //}
                        if (_this.selectedDevice && output.deviceId === _this.selectedDevice.id) {
                            var distance = Math.round((Math.sqrt(Math.pow(output.xCentimeters, 2) + Math.pow(output.yCentimeters, 2))) / 100) + 'm';
                            output.name = distance;
                        }
                        _this.positionOutputs.push(output);
                    }
                    //console.log(new Date() + '-' + this.positionOutputs.length);
                    _this.draw();
                };
                reader.readAsArrayBuffer(message.data);
            });
        };
        LivePositionsComponent.prototype.getColorByDeviceId = function (deviceId) {
            var deviceColor;
            var info = this.deviceInfo.filter(function (d) {
                return d.deviceId === deviceId;
            })[0];
            if (!info) {
                var index = this.deviceInfo.length <= 23 ? this.deviceInfo.length : this.deviceInfo.length % 23;
                var color = this.graphColors[index];
                this.deviceInfo.push({
                    deviceId: deviceId,
                    color: color
                });
                deviceColor = color;
            }
            else {
                deviceColor = info.color;
            }
            return deviceColor;
        };
        LivePositionsComponent.prototype.draw = function () {
            var _this = this;
            var lineWidth = Math.round((4 / (6000 / this.pixelsPerMeter)) * this.zoomScale);
            lineWidth = lineWidth > 0 ? lineWidth : 1;
            var radius = Math.round(((this.pixelsPerMeter / 100) / 4) * this.zoomScale);
            if (this.drawMode === 'canvas') {
                this.canvasContext.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
                var blur_1 = Math.round((38 / (6000 / this.pixelsPerMeter)) * this.zoomScale);
                this.positionOutputs.forEach(function (d) {
                    _this.canvasContext.beginPath();
                    _this.canvasContext.arc(Math.round(d.x), Math.round(d.y), radius, 0, 2 * Math.PI);
                    _this.canvasContext.lineWidth = lineWidth;
                    _this.canvasContext.strokeStyle = d.color;
                    _this.canvasContext.shadowBlur = radius;
                    _this.canvasContext.shadowColor = d.color;
                    _this.canvasContext.stroke();
                });
            }
            else if (this.drawMode === 'svg') {
                this.circles = this.circlesG
                    .selectAll('circle')
                    .data(this.positionOutputs, function (d) {
                    return d.deviceId.toString();
                });
                this.circles.exit().remove();
                this.circles.enter()
                    .append('circle')
                    .attr('r', radius)
                    .style('stroke-width', lineWidth)
                    .style('fill-opacity', 0);
                //console.log(this.positionOutputs.length);
                this.circles
                    .attr('cx', function (d) {
                    return d.x;
                })
                    .attr('cy', function (d) {
                    return d.y;
                })
                    .style('stroke', function (d) { return d.color; })
                    .style('stroke-width', lineWidth)
                    .attr('r', radius);
            }
            else {
                this.positions = this.positionOutputs.map(function (o) {
                    return {
                        deviceId: o.deviceId,
                        name: o.name,
                        width: radius * 2,
                        height: radius * 2,
                        top: o.y - radius,
                        left: o.x - radius,
                        border: lineWidth + 'px solid ' + o.color,
                        borderRadius: radius * 2,
                        glow: "0px 1px " + radius + "px rgba(" + o.rgb.r + ", " + o.rgb.g + ", " + o.rgb.b + ", 0.5) inset, 0px 0px " + radius * 2 + "px rgba(" + o.rgb.r + ", " + o.rgb.g + ", " + o.rgb.b + ", 0.5)"
                    };
                });
            }
        };
        LivePositionsComponent.prototype.hexToRgb = function (hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        };
        LivePositionsComponent.prototype.onUnitIdChanged = function () {
            this.canvasContext.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
            this.connectToWebSocket();
        };
        LivePositionsComponent.prototype.hideToolbar = function () {
            this.mode = WwxDemo.EditMode.View;
            this.zoomScale = this.viewScale;
            this.zoomOrigin = this.viewZoomOrigin;
            this.hideMenu = true;
            this.currentZone = undefined;
            $('#map').draggable('option', 'disabled', true);
            $('.room-boundary').draggable('option', 'disabled', true);
            $('.chair-wrapper').draggable('option', 'disabled', true);
            $('.door-wrapper').draggable('option', 'disabled', true);
            $('.rect').draggable('option', 'disabled', true);
            $('.rectangle').draggable('option', 'disabled', true);
        };
        LivePositionsComponent.prototype.showToolbar = function () {
            this.hideMenu = false;
            this.viewScale = this.zoomScale;
            this.viewZoomOrigin = this.zoomOrigin;
            this.zoomScale = 1;
            this.zoomOrigin = '50% 50%';
            $('.room-boundary').draggable('option', 'disabled', false);
            $('.chair-wrapper').draggable('option', 'disabled', false);
            $('.door-wrapper').draggable('option', 'disabled', false);
            $('.rect').draggable('option', 'disabled', false);
            $('.rectangle').draggable('option', 'disabled', false);
        };
        LivePositionsComponent.prototype.selectMode = function (mode) {
            if (this.mode === mode) {
                this.mode = WwxDemo.EditMode.None;
            }
            else {
                this.mode = mode;
            }
            switch (mode) {
                case WwxDemo.EditMode.Map:
                    if (!this.autoScale) {
                        $('#map').draggable('option', 'disabled', false);
                    }
                    break;
            }
        };
        LivePositionsComponent.prototype.selectConfigMode = function () {
            if (this.mode == WwxDemo.EditMode.Config) {
                this.mode = WwxDemo.EditMode.None;
            }
            else {
                this.mode = WwxDemo.EditMode.Config;
            }
            $('#map').draggable('option', 'disabled', true);
        };
        LivePositionsComponent.prototype.selectRulerMode = function () {
            if (this.mode == WwxDemo.EditMode.Ruler) {
                this.mode = WwxDemo.EditMode.None;
            }
            else {
                this.mode = WwxDemo.EditMode.Ruler;
            }
        };
        LivePositionsComponent.prototype.selectBoundaryMode = function () {
            if (this.mode == WwxDemo.EditMode.Boundary) {
                this.mode = WwxDemo.EditMode.None;
            }
            else {
                this.mode = WwxDemo.EditMode.Boundary;
            }
        };
        LivePositionsComponent.prototype.selectChairsMode = function () {
            if (this.mode == WwxDemo.EditMode.Chairs) {
                this.mode = WwxDemo.EditMode.None;
            }
            else {
                this.mode = WwxDemo.EditMode.Chairs;
            }
        };
        LivePositionsComponent.prototype.selectZoneMode = function () {
            if (this.mode == WwxDemo.EditMode.Zone) {
                this.mode = WwxDemo.EditMode.None;
            }
            else {
                this.mode = WwxDemo.EditMode.Zone;
            }
        };
        LivePositionsComponent.prototype.selectRectMode = function () {
            if (this.mode == WwxDemo.EditMode.Rectangle) {
                this.mode = WwxDemo.EditMode.None;
            }
            else {
                this.mode = WwxDemo.EditMode.Rectangle;
            }
        };
        LivePositionsComponent.prototype.selectDoorMode = function () {
            if (this.mode == WwxDemo.EditMode.Doors) {
                this.mode = WwxDemo.EditMode.None;
            }
            else {
                this.mode = WwxDemo.EditMode.Doors;
            }
        };
        LivePositionsComponent.prototype.selectSaveMode = function () {
            if (this.mode == WwxDemo.EditMode.Save) {
                this.mode = WwxDemo.EditMode.None;
            }
            else {
                this.mode = WwxDemo.EditMode.Save;
                this.deselectZone();
            }
        };
        LivePositionsComponent.prototype.selectOpenMode = function () {
            if (this.mode == WwxDemo.EditMode.Open) {
                this.mode = WwxDemo.EditMode.None;
            }
            else {
                this.mode = WwxDemo.EditMode.Open;
                this.deselectZone();
            }
            this.getConfigurations();
        };
        LivePositionsComponent.prototype.deselectZone = function () {
            this.currentZone = undefined;
            this.zones.forEach(function (r) {
                r.selected = false;
            });
        };
        LivePositionsComponent.prototype.handleMouseDown = function (handle, event) {
            this.currentHandle = handle;
            event.stopPropagation();
        };
        LivePositionsComponent.prototype.boundaryHandleMouseDown = function (handle, event) {
            this.currentBoundaryHandle = handle;
            this.resizingBoundary = true;
            event.stopPropagation();
        };
        LivePositionsComponent.prototype.canvasMouseDown = function (event) {
            if (this.mode === WwxDemo.EditMode.Config && !this.draggingCanvas && (!this.lockSensorScale || !this.lockSensorRotate)) {
                this.rotateStart = { x: event.clientX, y: event.clientY };
                this.origRad = this.currentRad; //this.getRadiansFromPoints(this.sensorPosition,this.rotateStart);
                this.origScale = this.pixelsPerMeter;
                this.draggingCanvas = true;
            }
        };
        LivePositionsComponent.prototype.canvasMouseUp = function (event) {
            var _this = this;
            if (this.currentHandle) {
                this.currentHandle = undefined;
            }
            if (this.currentBoundaryHandle) {
                this.currentBoundaryHandle = undefined;
                this.$timeout(function () {
                    _this.resizingBoundary = false;
                }, 300);
            }
            if (this.draggingCanvas) {
                this.draggingCanvas = false;
            }
            //$event.stopPropagation();
        };
        LivePositionsComponent.prototype.canvasClicked = function (event) {
            var _this = this;
            this.deselectZone();
            if (this.mode === WwxDemo.EditMode.Boundary && !this.resizingBoundary) {
                if (!this.newBoundary) {
                    this.boundary = false;
                    this.newBoundary = {
                        top: event.clientY,
                        left: event.clientX,
                        origTop: event.clientY,
                        origLeft: event.clientX
                    };
                }
                else {
                    //this.boundaries.push(angular.copy(this.newBoundary));
                    this.newBoundary.handles = [
                        {
                            class: 'top-left',
                            top: -5,
                            left: -5
                        },
                        {
                            class: 'top-right',
                            top: -5,
                            left: this.newBoundary.width - 5
                        },
                        {
                            class: 'bottom-right',
                            top: this.newBoundary.height - 5,
                            left: this.newBoundary.width - 5
                        },
                        {
                            class: 'bottom-left',
                            top: this.newBoundary.height - 5,
                            left: -5
                        }
                    ];
                    this.boundary = angular.copy(this.newBoundary);
                    this.newBoundary = undefined;
                    this.updateSensorRays();
                }
            }
            else if (this.mode === WwxDemo.EditMode.Rectangle) {
                if (!this.newRectangle) {
                    this.newRectangle = {
                        top: event.clientY,
                        left: event.clientX,
                        origTop: event.clientY,
                        origLeft: event.clientX,
                    };
                }
                else {
                    this.rectangles.push(angular.copy(this.newRectangle));
                    this.newRectangle = false;
                    this.$timeout(function () {
                        _this.bindRectangles();
                    }, 1);
                }
            }
            else if (this.mode === WwxDemo.EditMode.Zone) {
                if (!this.currentZone && !this.editingZone) {
                    if (!this.newZone) {
                        this.newZone = {
                            top: event.clientY,
                            left: event.clientX,
                            origTop: event.clientY,
                            origLeft: event.clientX,
                            id: 'z' + (this.zones.length + 1),
                            name: 'zone ' + (this.zones.length + 1),
                            minDwell: 0,
                            minPopulation: 0,
                            dwellEvent: true,
                            popEvent: true,
                            style: 'dark'
                        };
                    }
                    else {
                        this.newZone.handles = [
                            {
                                class: 'top-left',
                                top: -5,
                                left: -5
                            },
                            {
                                class: 'top-right',
                                top: -5,
                                left: this.newZone.width - 5
                            },
                            {
                                class: 'bottom-right',
                                top: this.newZone.height - 5,
                                left: this.newZone.width - 5
                            },
                            {
                                class: 'bottom-left',
                                top: this.newZone.height - 5,
                                left: -5
                            }
                            //{
                            //    class: 'top-left',
                            //    top: this.newRectangle.top - 5,
                            //    left: this.newRectangle.left - 5
                            //},
                            //{
                            //    class: 'top-right',
                            //    top: this.newRectangle.top - 5,
                            //    left: (this.newRectangle.left + this.newRectangle.width) - 5
                            //},
                            //{
                            //    class: 'bottom-right',
                            //    top: (this.newRectangle.top + this.newRectangle.height) - 5,
                            //    left: (this.newRectangle.left + this.newRectangle.width) - 5
                            //},
                            //{
                            //    class: 'bottom-left',
                            //    top: (this.newRectangle.top + this.newRectangle.height) - 5,
                            //    left: this.newRectangle.left - 5
                            //}
                        ];
                        this.zones.push(angular.copy(this.newZone));
                        this.newZone = false;
                        this.$timeout(function () {
                            _this.bindZones();
                        }, 1);
                    }
                }
                else {
                    this.deselectZone();
                }
            }
            else if (this.mode === WwxDemo.EditMode.Chairs) {
                if (!this.dragging) {
                    var width = Math.round((this.pixelsPerMeter / 100) * .75);
                    this.chairs.push({
                        top: event.clientY - Math.round(width / 2),
                        left: event.clientX - Math.round(width / 2),
                        width: width,
                        transform: this.defaultTransform
                    });
                    this.$timeout(function () {
                        var chair = $('.chair');
                        chair.rotatable({
                            snap: true,
                            step: 45,
                            start: function () {
                                _this.dragging = true;
                            },
                            stop: function () {
                                _this.$timeout(function () {
                                    _this.dragging = false;
                                }, 10);
                            }
                        });
                        var chairWrapper = $('.chair-wrapper');
                        var me = _this;
                        chairWrapper.draggable({
                            //containment: '#canvas-container',
                            start: function (event, ui) {
                                _this.draggableStartAdjust(ui);
                            },
                            drag: function (event, ui) {
                                _this.draggableDragAdjust(ui);
                            },
                            stop: function (event, ui) {
                                var chairs = me.chairs;
                                $('.chair-wrapper').each(function (index, element) {
                                    var pos = $(this).position();
                                    chairs[index].top = pos.top;
                                    chairs[index].left = pos.left;
                                    chairs[index].transform = me.getTransform($(this).find('.chair'));
                                });
                            }
                        });
                    });
                }
            }
            else if (this.mode === WwxDemo.EditMode.Doors) {
                if (!this.dragging) {
                    var width = Math.round((this.pixelsPerMeter / 100) * .8128);
                    this.doors.push({
                        top: event.clientY - Math.round(width / 2),
                        left: event.clientX - Math.round(width / 2),
                        width: width,
                        transform: this.defaultTransform
                    });
                    this.$timeout(function () {
                        var door = $('.door');
                        door.rotatable({
                            snap: true,
                            step: 90,
                            start: function () {
                                _this.dragging = true;
                            },
                            stop: function () {
                                _this.$timeout(function () {
                                    _this.dragging = false;
                                }, 10);
                            }
                        });
                        var doorWrapper = $('.door-wrapper');
                        var me = _this;
                        doorWrapper.draggable({
                            //containment: '#canvas-container',
                            start: function (event, ui) {
                                _this.draggableStartAdjust(ui);
                            },
                            drag: function (event, ui) {
                                _this.draggableDragAdjust(ui);
                            },
                            stop: function (event, ui) {
                                var doors = _this.doors;
                                $('.door-wrapper').each(function (index) {
                                    var pos = $(this).position();
                                    doors[index].top = pos.top;
                                    doors[index].left = pos.left;
                                    doors[index].transform = me.getTransform($(this).find('.door'));
                                });
                            }
                        });
                    });
                }
            }
            else if (this.mode === WwxDemo.EditMode.None || this.mode === WwxDemo.EditMode.Config) {
                var radius_1 = Math.round((this.pixelsPerMeter / 100) / 4);
                var hitTarget_1 = false;
                this.positionOutputs.forEach(function (p) {
                    var top = p.y - radius_1;
                    var bottom = p.y + radius_1;
                    var left = p.x - radius_1;
                    var right = p.x + radius_1;
                    if (event.clientX >= left && event.clientX <= right && event.clientY >= top && event.clientY <= bottom) {
                        var existing = _this.namedIds.filter(function (n) {
                            return n.id === p.deviceId;
                        })[0];
                        if (_this.mode === WwxDemo.EditMode.None) {
                            if (!existing) {
                                _this.selectedDevice = {
                                    id: p.deviceId,
                                    name: p.deviceId
                                };
                                _this.namedIds.push(_this.selectedDevice);
                            }
                            else {
                                _this.selectedDevice = existing;
                            }
                        }
                        else {
                            var distance = Math.round(Math.sqrt(Math.pow(p.xCentimeters, 2) + Math.pow(p.yCentimeters, 2)) * 10 / 10) + 'cm';
                            _this.selectedDevice = {
                                id: p.deviceId,
                                name: distance
                            };
                        }
                        hitTarget_1 = true;
                    }
                });
                if (!hitTarget_1) {
                    this.selectedDevice = false;
                }
            }
            else if (this.mode == WwxDemo.EditMode.Ruler) {
                if (!this.measuring) {
                    var angle = Math.atan2(50, 0) * 180 / Math.PI;
                    this.ruler = {
                        top: event.clientY,
                        left: event.clientX,
                        width: Math.sqrt(0 + 2500),
                        transform: 'rotate(' + angle + 'deg)',
                        measurement: this.getMeasurement(Math.sqrt(0 + 2500))
                    };
                    this.measuring = true;
                }
                else {
                    this.measuring = false;
                }
            }
        };
        LivePositionsComponent.prototype.updateBoundaryHandles = function () {
            var _this = this;
            this.boundary.handles.forEach(function (h) {
                switch (h.class) {
                    case 'top-left':
                        h.top = -5;
                        h.left = -5;
                        break;
                    case 'top-right':
                        h.top = -5;
                        h.left = _this.boundary.width - 5;
                        break;
                    case 'bottom-right':
                        h.top = _this.boundary.height - 5;
                        h.left = _this.boundary.width - 5;
                        break;
                    case 'bottom-left':
                        h.top = _this.boundary.height - 5;
                        h.left = -5;
                        break;
                }
            });
        };
        LivePositionsComponent.prototype.updateZoneHandles = function (zone) {
            zone.handles.forEach(function (h) {
                switch (h.class) {
                    case 'top-left':
                        h.top = -5;
                        h.left = -5;
                        break;
                    case 'top-right':
                        h.top = -5;
                        h.left = zone.width - 5;
                        break;
                    case 'bottom-right':
                        h.top = zone.height - 5;
                        h.left = zone.width - 5;
                        break;
                    case 'bottom-left':
                        h.top = zone.height - 5;
                        h.left = -5;
                        break;
                }
            });
        };
        LivePositionsComponent.prototype.getDotLabelPosition = function (dot) {
            var radius = Math.round((this.pixelsPerMeter / 100) / 4);
            return {
                top: (dot.y - radius - 20) + 'px',
                left: (dot.x) + 'px'
            };
        };
        LivePositionsComponent.prototype.getMeasurement = function (pixels) {
            var measurement = pixels / (this.pixelsPerMeter / 100);
            if (this.unit === 'ft') {
                measurement = measurement * this.feetPerMeter;
            }
            return Math.round(measurement * 10) / 10;
        };
        LivePositionsComponent.prototype.getRadiansFromPoints = function (p1, p2) {
            return Math.atan2(p2.y - p1.y, p2.x - p1.x);
        };
        LivePositionsComponent.prototype.getAngleFromPoints = function (p1, p2) {
            return (this.getRadiansFromPoints(p1, p2) * 180) / Math.PI;
        };
        LivePositionsComponent.prototype.getDistanceFromPoints = function (p1, p2) {
            return Math.sqrt((Math.pow(p2.x - p1.x, 2)) + (Math.pow(p2.y - p1.y, 2)));
        };
        LivePositionsComponent.prototype.changePixelsPerMeter = function (ppm) {
            this.pixelsPerMeter = ppm;
            this.onScaleChanged();
        };
        LivePositionsComponent.prototype.getDegreesFromRadians = function (rad) {
            return Math.round(((rad * 180) / Math.PI) * 100) / 100;
        };
        LivePositionsComponent.prototype.onRotationChanged = function () {
            this.currentRad = this.currentAngle * Math.PI / 180;
            this.sensorTransform = 'rotate(' + this.currentAngle + 'deg)';
        };
        LivePositionsComponent.prototype.canvasMouseMove = function (event) {
            this.mousePosition = {
                x: event.clientX,
                y: event.clientY
            };
            if (this.draggingCanvas) {
                this.rotateEnd = this.mousePosition;
                //const angle = this.getAngleFromPoints(this.rotateStart, this.rotateEnd);
                var sensorPos = {
                    x: this.sensorPosition.left,
                    y: this.sensorPosition.top
                };
                var radians = this.getRadiansFromPoints(sensorPos, this.rotateEnd);
                var radianStart = this.getRadiansFromPoints(sensorPos, this.rotateStart);
                var radDiff = radians - radianStart;
                var distance = this.getDistanceFromPoints(sensorPos, this.rotateEnd);
                var startDistance = this.getDistanceFromPoints(sensorPos, this.rotateStart);
                var distRatio = distance / startDistance;
                if (!this.lockSensorScale) {
                    this.changePixelsPerMeter(this.origScale * distRatio);
                }
                if (!this.lockSensorRotate) {
                    this.currentRad = this.origRad + radDiff;
                    this.currentAngle = this.getDegreesFromRadians(this.currentRad);
                    this.sensorTransform = 'rotate(' + this.currentAngle + 'deg)';
                }
            }
            if (this.currentHandle) {
                var bottom = this.currentZone.height + this.currentZone.top;
                var right = this.currentZone.width + this.currentZone.left;
                switch (this.currentHandle.class) {
                    case 'top-left':
                        this.currentZone.top = event.clientY;
                        this.currentZone.left = event.clientX;
                        this.currentZone.height = bottom - event.clientY;
                        this.currentZone.width = right - event.clientX;
                        break;
                    case 'top-right':
                        this.currentZone.top = event.clientY;
                        this.currentZone.height = bottom - event.clientY;
                        this.currentZone.width = event.clientX - this.currentZone.left;
                        break;
                    case 'bottom-right':
                        this.currentZone.height = event.clientY - this.currentZone.top;
                        this.currentZone.width = event.clientX - this.currentZone.left;
                        break;
                    case 'bottom-left':
                        this.currentZone.left = event.clientX;
                        this.currentZone.height = event.clientY - this.currentZone.top;
                        this.currentZone.width = right - this.currentZone.left;
                        break;
                }
                this.updateZoneHandles(this.currentZone);
                this.updateZoneMeasurements(this.currentZone);
            }
            else if (this.currentBoundaryHandle) {
                var bottom = this.boundary.height + this.boundary.top;
                var right = this.boundary.width + this.boundary.left;
                switch (this.currentBoundaryHandle.class) {
                    case 'top-left':
                        this.boundary.top = event.clientY;
                        this.boundary.left = event.clientX;
                        this.boundary.height = bottom - event.clientY;
                        this.boundary.width = right - event.clientX;
                        break;
                    case 'top-right':
                        this.boundary.top = event.clientY;
                        this.boundary.height = bottom - event.clientY;
                        this.boundary.width = event.clientX - this.boundary.left;
                        break;
                    case 'bottom-right':
                        this.boundary.height = event.clientY - this.boundary.top;
                        this.boundary.width = event.clientX - this.boundary.left;
                        break;
                    case 'bottom-left':
                        this.boundary.left = event.clientX;
                        this.boundary.height = event.clientY - this.boundary.top;
                        this.boundary.width = right - this.boundary.left;
                        break;
                }
                this.boundwidthMeasurement = this.getMeasurement(this.boundary.width);
                this.boundheightMeasurement = this.getMeasurement(this.boundary.height);
                this.updateBoundaryHandles();
                this.updateSensorRays();
            }
            else {
                if (this.mode === WwxDemo.EditMode.Boundary && this.newBoundary) {
                    if (event.clientX < this.newBoundary.origLeft && event.clientY < this.newBoundary.origTop) {
                        this.newBoundary.top = event.clientY;
                        this.newBoundary.left = event.clientX;
                        this.newBoundary.width = this.newBoundary.origLeft - event.clientX;
                        this.newBoundary.height = this.newBoundary.origTop - event.clientY;
                    }
                    else if (event.clientY < this.newBoundary.origTop) {
                        this.newBoundary.top = event.clientY;
                        this.newBoundary.left = this.newBoundary.origLeft;
                        this.newBoundary.width = event.clientX - this.newBoundary.origLeft;
                        this.newBoundary.height = this.newBoundary.origTop - event.clientY;
                    }
                    else if (event.clientX < this.newBoundary.origLeft) {
                        this.newBoundary.top = this.newBoundary.origTop;
                        this.newBoundary.left = event.clientX;
                        this.newBoundary.width = this.newBoundary.origLeft - event.clientX;
                        this.newBoundary.height = event.clientY - this.newBoundary.origTop;
                    }
                    else {
                        this.newBoundary.top = this.newBoundary.origTop;
                        this.newBoundary.left = this.newBoundary.origLeft;
                        this.newBoundary.width = Math.abs(event.clientX - this.newBoundary.left);
                        this.newBoundary.height = Math.abs(event.clientY - this.newBoundary.top);
                    }
                    //this.newBoundary.width = event.clientX - this.newBoundary.left;
                    //this.newBoundary.height = event.clientY - this.newBoundary.top;
                    this.boundwidthMeasurement = this.getMeasurement(this.newBoundary.width);
                    this.boundheightMeasurement = this.getMeasurement(this.newBoundary.height);
                }
                else if (this.mode === WwxDemo.EditMode.Rectangle && this.newRectangle) {
                    if (event.clientX < this.newRectangle.origLeft && event.clientY < this.newRectangle.origTop) {
                        this.newRectangle.top = event.clientY;
                        this.newRectangle.left = event.clientX;
                        this.newRectangle.width = this.newRectangle.origLeft - event.clientX;
                        this.newRectangle.height = this.newRectangle.origTop - event.clientY;
                    }
                    else if (event.clientY < this.newRectangle.origTop) {
                        this.newRectangle.top = event.clientY;
                        this.newRectangle.left = this.newRectangle.origLeft;
                        this.newRectangle.width = event.clientX - this.newRectangle.origLeft;
                        this.newRectangle.height = this.newRectangle.origTop - event.clientY;
                    }
                    else if (event.clientX < this.newRectangle.origLeft) {
                        this.newRectangle.top = this.newRectangle.origTop;
                        this.newRectangle.left = event.clientX;
                        this.newRectangle.width = this.newRectangle.origLeft - event.clientX;
                        this.newRectangle.height = event.clientY - this.newRectangle.origTop;
                    }
                    else {
                        this.newRectangle.top = this.newRectangle.origTop;
                        this.newRectangle.left = this.newRectangle.origLeft;
                        this.newRectangle.width = Math.abs(event.clientX - this.newRectangle.left);
                        this.newRectangle.height = Math.abs(event.clientY - this.newRectangle.top);
                    }
                    this.newRectangle.widthMeasurement = this.getMeasurement(this.newRectangle.width);
                    this.newRectangle.heightMeasurement = this.getMeasurement(this.newRectangle.height);
                }
                else if (this.mode === WwxDemo.EditMode.Zone && this.newZone) {
                    if (event.clientX < this.newZone.origLeft && event.clientY < this.newZone.origTop) {
                        this.newZone.top = event.clientY;
                        this.newZone.left = event.clientX;
                        this.newZone.width = this.newZone.origLeft - event.clientX;
                        this.newZone.height = this.newZone.origTop - event.clientY;
                    }
                    else if (event.clientY < this.newZone.origTop) {
                        this.newZone.top = event.clientY;
                        this.newZone.left = this.newZone.origLeft;
                        this.newZone.width = event.clientX - this.newZone.origLeft;
                        this.newZone.height = this.newZone.origTop - event.clientY;
                    }
                    else if (event.clientX < this.newZone.origLeft) {
                        this.newZone.top = this.newZone.origTop;
                        this.newZone.left = event.clientX;
                        this.newZone.width = this.newZone.origLeft - event.clientX;
                        this.newZone.height = event.clientY - this.newZone.origTop;
                    }
                    else {
                        this.newZone.top = this.newZone.origTop;
                        this.newZone.left = this.newZone.origLeft;
                        this.newZone.width = Math.abs(event.clientX - this.newZone.left);
                        this.newZone.height = Math.abs(event.clientY - this.newZone.top);
                    }
                    this.newZone.widthMeasurement = this.getMeasurement(this.newZone.width);
                    this.newZone.heightMeasurement = this.getMeasurement(this.newZone.height);
                }
                else if (this.mode === WwxDemo.EditMode.Ruler && this.ruler && this.measuring) {
                    var distance = this.getDistance(this.ruler.left, this.ruler.top, event.clientX, event.clientY);
                    var angle = this.getAngle(this.ruler.left, this.ruler.top, event.clientX, event.clientY);
                    this.ruler.width = distance;
                    this.ruler.transform = 'rotate(' + angle + 'deg)';
                    this.ruler.measurement = this.getMeasurement(distance);
                }
            }
        };
        LivePositionsComponent.prototype.getDistance = function (x1, y1, x2, y2) {
            return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
        };
        LivePositionsComponent.prototype.getAngle = function (x1, y1, x2, y2) {
            return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        };
        LivePositionsComponent.prototype.onSocketAddressChanged = function () {
            this.connectToWebSocket();
        };
        LivePositionsComponent.prototype.onScaleChanged = function () {
            var _this = this;
            //if (this.boundary) {
            //    this.boundwidthMeasurement = this.getMeasurement(this.boundary.width);
            //    this.boundheightMeasurement = this.getMeasurement(this.boundary.height);
            //}
            this.chairs.forEach(function (c) {
                c.width = Math.round((_this.pixelsPerMeter / 100) * .75);
            });
            this.doors.forEach(function (c) {
                c.width = Math.round((_this.pixelsPerMeter / 100) * .8128);
            });
            this.zones.forEach(function (zone) {
                zone.width = _this.getPixels(zone.widthMeasurement);
                zone.height = _this.getPixels(zone.heightMeasurement);
            });
            this.rectangles.forEach(function (r) {
                r.width = _this.getPixels(r.widthMeasurement);
                r.height = _this.getPixels(r.heightMeasurement);
            });
            if (this.boundary) {
                this.boundary.width = this.getPixels(this.boundwidthMeasurement);
                this.boundary.height = this.getPixels(this.boundheightMeasurement);
                this.updateBoundaryHandles();
            }
        };
        LivePositionsComponent.prototype.repositionItem = function (item, ratio, mapPos) {
            var mapLeft = (item.left - this.mapOrigins.position.left) * ratio;
            var mapTop = (item.top - this.mapOrigins.position.top) * ratio;
            item.left = mapPos.left + mapLeft;
            item.top = mapPos.top + mapTop;
        };
        LivePositionsComponent.prototype.deleteZone = function (index, event) {
            this.zones.splice(index, 1);
            this.currentZone = undefined;
            event.stopPropagation();
        };
        LivePositionsComponent.prototype.deleteRectangle = function (index, event) {
            this.rectangles.splice(index, 1);
            event.stopPropagation();
        };
        LivePositionsComponent.prototype.stopClick = function (event) {
            if (this.mode != WwxDemo.EditMode.None) {
                event.stopPropagation();
            }
        };
        LivePositionsComponent.prototype.sensorClicked = function (event) {
            event.stopPropagation();
        };
        LivePositionsComponent.prototype.sensorMouseDown = function (event) {
            event.stopPropagation();
        };
        LivePositionsComponent.prototype.selectZone = function (event, zone) {
            event.stopPropagation();
        };
        LivePositionsComponent.prototype.mouseDownZone = function (event, zone) {
            event.stopPropagation();
            this.zones.forEach(function (r) {
                if (r.id === zone.id) {
                    r.selected = true;
                }
                else {
                    r.selected = false;
                }
            });
            this.currentZone = zone;
        };
        LivePositionsComponent.prototype.deleteChair = function (index, event) {
            this.chairs.splice(index, 1);
            event.stopPropagation();
        };
        LivePositionsComponent.prototype.deleteDoor = function (index, event) {
            this.doors.splice(index, 1);
            event.stopPropagation();
        };
        LivePositionsComponent.prototype.getPixels = function (measurement) {
            var pixels = measurement * (this.pixelsPerMeter / 100);
            if (this.unit === 'ft') {
                pixels = pixels / this.feetPerMeter;
            }
            return Math.round(pixels);
        };
        LivePositionsComponent.prototype.onRulerMeasurementChanged = function () {
            var measurement = +this.ruler.measurement;
            if (this.unit === 'ft') {
                measurement = measurement / this.feetPerMeter;
            }
            this.changePixelsPerMeter(Math.round((this.ruler.width / measurement) * 100));
        };
        LivePositionsComponent.prototype.sizeBoundary = function () {
            var pixelWidth = this.getPixels(this.boundwidthMeasurement);
            var pixelHeight = this.getPixels(this.boundheightMeasurement);
            var availableWidth = this.canvasWidth - 265;
            var availableHeight = this.canvasHeight - 100;
            if (pixelWidth >= pixelHeight || pixelWidth > availableWidth) {
                //if (pixelWidth > availableWidth) {
                var widthMeasurement = this.unit === 'm' ? this.boundwidthMeasurement : (this.boundwidthMeasurement / this.feetPerMeter);
                this.pixelsPerMeter = Math.round((availableWidth / widthMeasurement) * 100);
                pixelWidth = this.getPixels(this.boundwidthMeasurement);
                pixelHeight = this.getPixels(this.boundheightMeasurement);
                //}
            }
            if (pixelHeight > pixelWidth || pixelHeight > availableHeight) {
                //if (pixelHeight > availableHeight) {
                var heightMeasurement = this.unit === 'm' ? this.boundheightMeasurement : (this.boundheightMeasurement / this.feetPerMeter);
                this.pixelsPerMeter = Math.round((availableHeight / heightMeasurement) * 100);
                pixelWidth = this.getPixels(this.boundwidthMeasurement);
                pixelHeight = this.getPixels(this.boundheightMeasurement);
                //}
            }
            var left = Math.round((this.canvasWidth / 2) - (pixelWidth / 2));
            var top = Math.round((this.canvasHeight / 2) - (pixelHeight / 2));
            this.boundary = {
                top: top,
                left: left,
                width: this.getPixels(this.boundwidthMeasurement),
                height: this.getPixels(this.boundheightMeasurement)
            };
            this.boundary.handles = [
                {
                    class: 'top-left',
                    top: -5,
                    left: -5
                },
                {
                    class: 'top-right',
                    top: -5,
                    left: this.boundary.width - 5
                },
                {
                    class: 'bottom-right',
                    top: this.boundary.height - 5,
                    left: this.boundary.width - 5
                },
                {
                    class: 'bottom-left',
                    top: this.boundary.height - 5,
                    left: -5
                }
            ];
            this.onScaleChanged();
        };
        LivePositionsComponent.prototype.onBoundarySizeChanged = function () {
            this.boundwidthMeasurement = +this.boundwidthMeasurement;
            this.boundheightMeasurement = +this.boundheightMeasurement;
            if (this.boundwidthMeasurement != 0 && this.boundheightMeasurement != 0) {
                this.sizeBoundary();
                this.updateSensorRays();
            }
        };
        LivePositionsComponent.prototype.isSensorInBoundary = function () {
            if (!this.boundary) {
                return false;
            }
            var boundaryBottom = this.boundary.top + this.boundary.height;
            var boundaryRight = this.boundary.left + this.boundary.width;
            return this.sensorPosition.left >= this.boundary.left && this.sensorPosition.left < boundaryRight && this.sensorPosition.top >= this.boundary.top && this.sensorPosition.top < boundaryBottom;
        };
        LivePositionsComponent.prototype.updateSensorRays = function () {
            if (!this.isSensorInBoundary()) {
                this.clearRays();
                return;
            }
            var sensorPosition = $('#sensor').position();
            var rayHeight = $('#sensor').position().top - this.boundary.top;
            this.northRay = {
                top: ($('#sensor').position().top - this.boundary.top) * -1,
                left: 0,
                width: 2,
                height: $('#sensor').position().top - this.boundary.top,
                measurementTop: Math.round((($('#sensor').position().top - this.boundary.top) * -1) / 2),
                measurement: this.getMeasurement(rayHeight)
            };
            var rayWidth = sensorPosition.left - this.boundary.left;
            var rayLeft = (rayWidth) * -1;
            this.westRay = {
                top: 0,
                left: rayLeft,
                width: rayWidth,
                height: 2,
                measurementLeft: Math.round(rayLeft / 2) - 30,
                measurement: this.getMeasurement(rayWidth)
            };
            rayHeight = (this.boundary.top + this.boundary.height) - sensorPosition.top;
            this.southRay = {
                top: 0,
                left: 0,
                width: 2,
                height: rayHeight,
                measurementTop: Math.round(rayHeight / 2),
                measurementLeft: 10,
                measurement: this.getMeasurement(rayHeight)
            };
            rayWidth = (this.boundary.left + this.boundary.width) - sensorPosition.left;
            this.eastRay = {
                top: 0,
                left: 0,
                width: rayWidth,
                height: 2,
                measurementTop: -20,
                measurementLeft: Math.round(rayWidth / 2) - 30,
                measurement: this.getMeasurement(rayWidth)
            };
        };
        LivePositionsComponent.prototype.clearMap = function () {
            this.mapPath = undefined;
            $('#map-file').val('');
        };
        LivePositionsComponent.prototype.clearBoundary = function () {
            this.boundary = false;
            this.boundheightMeasurement = 0;
            this.boundwidthMeasurement = 0;
            this.clearRays();
        };
        LivePositionsComponent.prototype.clearRays = function () {
            this.northRay = false;
            this.eastRay = false;
            this.southRay = false;
            this.westRay = false;
        };
        LivePositionsComponent.prototype.clearChairs = function () {
            this.chairs = [];
        };
        LivePositionsComponent.prototype.clearRectangles = function () {
            this.zones = [];
        };
        LivePositionsComponent.prototype.clearDoors = function () {
            this.doors = [];
        };
        LivePositionsComponent.prototype.clearScreen = function () {
            this.clearBoundary();
            this.clearChairs();
            this.clearRectangles();
            this.clearDoors();
            this.currentZone = undefined;
        };
        LivePositionsComponent.prototype.getTransform = function (element) {
            return element.attr('style').replace('transform: ', '').replace(';', '');
        };
        LivePositionsComponent.prototype.getCurrentConfiguration = function () {
            var me = this;
            if (this.boundary) {
                this.boundary.top = $('.room-boundary').position().top;
                this.boundary.left = $('.room-boundary').position().left;
            }
            var chairs = this.chairs;
            $('.chair-wrapper').each(function (index, element) {
                var pos = $(this).position();
                chairs[index].top = pos.top;
                chairs[index].left = pos.left;
                chairs[index].transform = me.getTransform($(this).find('.chair'));
            });
            var rectangles = this.rectangles;
            $('.rect').each(function (index, el) {
                var pos = $(this).position();
                rectangles[index].top = pos.top;
                rectangles[index].left = pos.left;
            });
            var zones = this.zones;
            $('.rectangle').each(function (index) {
                var pos = $(this).position();
                zones[index].top = Math.round(pos.top);
                zones[index].left = Math.round(pos.left);
                zones[index].width = Math.round(zones[index].width);
                zones[index].height = Math.round(zones[index].height);
            });
            var doors = this.doors;
            $('.door-wrapper').each(function (index) {
                var pos = $(this).position();
                doors[index].top = pos.top;
                doors[index].left = pos.left;
                doors[index].transform = me.getTransform($(this).find('.door'));
            });
            var currentConfiguration = {
                name: this.configName,
                unitId: this.unitId,
                unit: this.unit,
                mapPath: this.mapPath,
                mapPosition: this.mapPosition,
                pixelsPerMeter: this.pixelsPerMeter,
                sensorPosition: this.sensorPosition,
                sensorRad: this.currentRad,
                sensorTransform: this.getTransform($('#rotate')),
                boundary: this.boundary,
                boundwidthMeasurement: this.boundwidthMeasurement,
                boundheightMeasurement: this.boundheightMeasurement,
                chairs: chairs,
                zones: zones,
                doors: doors,
                rectangles: rectangles,
                windowSize: {
                    width: this.$window.innerWidth,
                    height: this.$window.innerHeight
                },
                mapOrigins: this.mapOrigins,
                viewScale: this.viewScale,
                viewZoomOrigin: this.viewZoomOrigin,
                degreeStep: this.degreeStep,
                scaleStep: this.scaleStep,
                lockSensorScale: this.lockSensorScale,
                lockSensorRotate: this.lockSensorRotate,
                autoScale: this.autoScale
            };
            return currentConfiguration;
        };
        LivePositionsComponent.prototype.saveToBrowser = function (currentConfiguration) {
            var _this = this;
            var configurationData = localStorage.getItem(this.localStorageKey);
            var savedConfigurations = configurationData ? JSON.parse(configurationData) : [];
            var existingConfig = savedConfigurations.filter(function (c) {
                return c.name === _this.configName;
            })[0];
            if (!existingConfig) {
                savedConfigurations.push(currentConfiguration);
            }
            else {
                for (var i = 0; i < savedConfigurations.length; i++) {
                    if (savedConfigurations[i].name === currentConfiguration.name) {
                        savedConfigurations[i] = currentConfiguration;
                    }
                }
            }
            localStorage.setItem(this.localStorageKey, JSON.stringify(savedConfigurations));
            this.showSaveSuccess = true;
            this.$timeout(function () {
                _this.showSaveSuccess = false;
            }, 1000);
        };
        LivePositionsComponent.prototype.saveToDatabase = function (currentConfiguration) {
            return this.service.insertConfig({
                name: currentConfiguration.name,
                data: JSON.stringify(currentConfiguration)
            });
        };
        LivePositionsComponent.prototype.publishConfigurationChanged = function () {
            this.dataStream.send('update_config ' + this.configName);
            if (this.configName !== this.currentZonesAnalysisConfig) {
                this.subscribeToZonesAnalysis();
                this.currentZonesAnalysisConfig = this.configName;
            }
        };
        LivePositionsComponent.prototype.saveConfiguration = function () {
            var _this = this;
            var currentConfiguration = this.getCurrentConfiguration();
            if (this.hasDatabase) {
                this.saveToDatabase(currentConfiguration)
                    .then(function (success) {
                    if (success) {
                        _this.saveToBrowser(currentConfiguration);
                        _this.shouldSubscribeToZones = true;
                        _this.publishConfigurationChanged();
                        _this.zones.forEach(function (r) {
                            r.occupied = false;
                            r.population = 0;
                        });
                    }
                });
            }
            else {
                this.saveToBrowser(currentConfiguration);
            }
        };
        LivePositionsComponent.prototype.export = function () {
            var currentConfiguration = this.getCurrentConfiguration();
            var a = document.createElement('a');
            var text = JSON.stringify(currentConfiguration);
            var file = new Blob([text], { type: 'text/plain' });
            a.href = URL.createObjectURL(file);
            var now = new Date();
            var month = now.getMonth() + 1;
            var timeStr = now.getFullYear() + '_' + month + '_' + now.getDate();
            a.download = currentConfiguration.name + '_' + timeStr + '.json';
            a.click();
        };
        LivePositionsComponent.prototype.getConfigurations = function () {
            var _this = this;
            if (this.configSource === 'browser') {
                var configurationData = localStorage.getItem(this.localStorageKey);
                this.savedConfigurations = configurationData ? JSON.parse(configurationData) : [];
            }
            else {
                this.service.getConfigs()
                    .then(function (configs) {
                    _this.savedConfigurations = configs.map(function (c) {
                        var data = c.data ? JSON.parse(c.data) : {};
                        data.configId = c.id;
                        return data;
                    });
                });
            }
        };
        LivePositionsComponent.prototype.loadConfig = function (config) {
            var _this = this;
            this.service.getConfigs()
                .then(function (configs) {
                var matched = configs.filter(function (c) { return c.name === config.name; })[0];
                if (matched) {
                    var data = matched.data ? JSON.parse(matched.data) : {};
                    _this.loadConfiguration(data, true);
                }
            });
        };
        LivePositionsComponent.prototype.loadConfiguration = function (config, clean) {
            var _this = this;
            this.getConfigurations();
            if (clean) {
                this.clearUndoStack();
            }
            this.clearScreen();
            this.configName = config.name;
            //this.configId = config.configId;
            this.mapPath = config.mapPath;
            this.mapOrigins = config.mapOrigins;
            this.mapPosition = config.mapPosition;
            this.autoScale = config.autoScale;
            this.pixelsPerMeter = config.pixelsPerMeter;
            this.sensorPosition = config.sensorPosition;
            this.currentRad = config.sensorRad;
            this.currentAngle = this.getDegreesFromRadians(this.currentRad);
            this.sensorTransform = config.sensorTransform.replace(';', '');
            this.boundary = config.boundary;
            this.boundwidthMeasurement = config.boundwidthMeasurement;
            this.boundheightMeasurement = config.boundheightMeasurement;
            this.chairs = config.chairs;
            this.rectangles = config.rectangles;
            if (!this.rectangles) {
                this.rectangles = [];
            }
            this.zones = config.zones;
            this.zones.forEach(function (r) {
                r.selected = false;
                r.occupied = false;
                r.population = 0;
                r.dwellPop = 0;
            });
            this.doors = config.doors;
            this.unitId = config.unitId;
            this.unit = config.unit;
            this.viewScale = config.viewScale ? config.viewScale : 1;
            this.viewZoomOrigin = config.viewZoomOrigin ? config.viewZoomOrigin : '50% 50%';
            this.degreeStep = config.degreeStep ? config.degreeStep : 0.5;
            this.scaleStep = config.scaleStep ? config.scaleStep : 1;
            this.lockSensorRotate = config.lockSensorRotate ? true : false;
            this.lockSensorScale = config.lockSensorScale ? true : false;
            if (this.mapPath) {
                this.$timeout(function () {
                    if (!_this.mapOrigins) {
                        _this.mapOrigins = {
                            position: $('#map').position(),
                            width: $('#map').width(),
                            height: $('#map').height()
                        };
                    }
                    _this.autoScale = true;
                    _this.mapPosition = {
                        top: '50%',
                        left: '50%'
                    };
                    _this.$timeout(function () {
                        _this.onWindowResize();
                    }, 10);
                }, 10);
            }
            this.canvasContext.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
            this.connectToWebSocket();
            this.hasSensorRotate = false;
            console.log(this);
            this.$timeout(function () {
                _this.hasSensorRotate = true;
                _this.$timeout(function () {
                    _this.updateSensorRays();
                    _this.bindChairRotation();
                    _this.bindDoorRotation();
                    _this.bindSensorRotation();
                    _this.bindZones();
                    _this.bindRectangles();
                }, 10);
            }, 10);
            this.shouldSubscribeToZones = true;
            this.subscribeToZonesAnalysis();
            this.$location.search('config', this.configName);
            // this.publishConfigurationChanged();
        };
        LivePositionsComponent.prototype.extractAngle = function (transform) {
            return +transform.replace('rotate(', '').replace('rad)', '');
        };
        LivePositionsComponent.prototype.bindSensorRotation = function () {
            //let rotate: any = $('#rotate');
            //rotate.rotatable({
            //    angle: this.extractAngle(this.sensorTransform),
            //    rotate: (event, ui) => {
            //        this.currentAngle = ui.angle.degrees;
            //        this.currentRad = ui.angle.current;
            //    }
            //});
        };
        LivePositionsComponent.prototype.storeUndo = function () {
            this.undoStack.push(angular.copy(this.getCurrentConfiguration()));
            this.undoIndex = this.undoStack.length - 1;
        };
        LivePositionsComponent.prototype.undo = function () {
            if (this.undoStack.length === 0) {
                return;
            }
            this.loadConfiguration(this.undoStack[this.undoIndex]);
            if (this.undoIndex > 0) {
                this.undoIndex--;
            }
        };
        LivePositionsComponent.prototype.clearUndoStack = function () {
            this.undoStack = [];
            this.undoIndex = 0;
        };
        LivePositionsComponent.prototype.bindRectangles = function () {
            var _this = this;
            $('.rect').draggable({
                //containment: '#canvas-container',
                delay: 100,
                start: function (event, ui) {
                    _this.draggableStartAdjust(ui);
                },
                drag: function (event, ui) {
                    _this.draggableDragAdjust(ui);
                },
                stop: function (event, ui) {
                    var rectangles = _this.rectangles;
                    $('.rect').each(function (index, el) {
                        var pos = $(this).position();
                        rectangles[index].top = pos.top;
                        rectangles[index].left = pos.left;
                    });
                }
            });
        };
        LivePositionsComponent.prototype.bindZones = function () {
            var _this = this;
            $('.rectangle').draggable({
                //containment: '#canvas-container',
                cancel: '.rect-handles',
                delay: 100,
                start: function (event, ui) {
                    _this.draggableStartAdjust(ui);
                    _this.$scope.$apply(function () {
                        _this.storeUndo();
                    });
                },
                drag: function (event, ui) {
                    _this.draggableDragAdjust(ui);
                },
                stop: function (event, ui) {
                    _this.$scope.$apply(function () {
                        _this.currentZone.top = ui.position.top;
                        _this.currentZone.left = ui.position.left;
                    });
                }
            });
            //$('.rect-handles.top-left').draggable({
            //    containment: '#canvas-container',
            //    start: (event, ui) => {
            //        this.$scope.$apply(() => {
            //            this.storeUndo();
            //            this.editingZone = true;
            //        });
            //    },
            //    drag: (event, ui) => {
            //        event.stopPropagation();
            //        this.$scope.$apply(() => {
            //            const bottom = this.currentZone.height + this.currentZone.top;
            //            const right = this.currentZone.width + this.currentZone.left;
            //            this.currentZone.top = ui.offset.top + 5;
            //            this.currentZone.left = ui.offset.left + 5;
            //            this.currentZone.height = bottom - (ui.offset.top + 5);
            //            this.currentZone.width = right - (ui.offset.left + 5);
            //            this.updateZoneHandles(this.currentZone);
            //            this.updateZoneMeasurements(this.currentZone);
            //        });
            //    },
            //    stop: (event, ui) => {
            //        event.stopPropagation();
            //        const el = $('.rect-handles.top-left');
            //        el.css('top', '-5px');
            //        el.css('left', '-5px');
            //        this.$timeout(() => {
            //            this.editingZone = false;
            //        }, 200);
            //    }
            //});
            //$('.rect-handles.top-right').draggable({
            //    containment: '#canvas-container',
            //    start: (event, ui) => {
            //        this.$scope.$apply(() => {
            //            this.storeUndo();
            //            this.editingZone = true;
            //        });
            //    },
            //    drag: (event, ui) => {
            //        this.$scope.$apply(() => {
            //            const bottom = this.currentZone.height + this.currentZone.top;
            //            const right = this.currentZone.width + this.currentZone.left;
            //            this.currentZone.top = (ui.offset.top + 5);
            //            this.currentZone.height = bottom - (ui.offset.top + 5);
            //            this.currentZone.width = (ui.offset.left + 5) - this.currentZone.left;
            //            this.updateZoneHandles(this.currentZone);
            //            this.updateZoneMeasurements(this.currentZone);
            //        });
            //    },
            //    stop: (event, ui) => {
            //        event.stopPropagation();
            //        const el = $('.rect-handles.top-right');
            //        el.css('top', '-5px');
            //        el.css('left', (this.currentZone.width - 5) + 'px');
            //        this.$timeout(() => {
            //            this.editingZone = false;
            //        }, 200);
            //    }
            //});
            //$('.rect-handles.bottom-right').draggable({
            //    containment: '#canvas-container',
            //    start: (event, ui) => {
            //        this.$scope.$apply(() => {
            //            this.storeUndo();
            //            this.editingZone = true;
            //        });
            //    },
            //    drag: (event, ui) => {
            //        this.$scope.$apply(() => {
            //            const bottom = this.currentZone.height + this.currentZone.top;
            //            const right = this.currentZone.width + this.currentZone.left;
            //            this.currentZone.height = (ui.offset.top + 5) - this.currentZone.top;
            //            this.currentZone.width = (ui.offset.left + 5) - this.currentZone.left;
            //            this.updateZoneHandles(this.currentZone);
            //            this.updateZoneMeasurements(this.currentZone);
            //        });
            //    },
            //    stop: (event, ui) => {
            //        event.stopPropagation();
            //        const el = $('.rect-handles.bottom-right');
            //        el.css('top', (this.currentZone.height - 5) + 'px');
            //        el.css('left', (this.currentZone.width - 5) + 'px');
            //        this.$timeout(() => {
            //            this.editingZone = false;
            //        }, 200);
            //    }
            //});
            //$('.rect-handles.bottom-left').draggable({
            //    containment: '#canvas-container',
            //    start: (event, ui) => {
            //        this.$scope.$apply(() => {
            //            this.storeUndo();
            //            this.editingZone = true;
            //        });
            //    },
            //    drag: (event, ui) => {
            //        this.$scope.$apply(() => {
            //            const bottom = this.currentZone.height + this.currentZone.top;
            //            const right = this.currentZone.width + this.currentZone.left;
            //            this.currentZone.left = (ui.offset.left + 5);
            //            this.currentZone.height = (ui.offset.top + 5) - this.currentZone.top;
            //            this.currentZone.width = right - this.currentZone.left;
            //            this.updateZoneHandles(this.currentZone);
            //            this.updateZoneMeasurements(this.currentZone);
            //        });
            //    },
            //    stop: (event, ui) => {
            //        event.stopPropagation();
            //        const el = $('.rect-handles.bottom-left');
            //        el.css('top', (this.currentZone.height - 5) + 'px');
            //        el.css('left', '-5px');
            //        this.$timeout(() => {
            //            this.editingZone = false;
            //        }, 200);
            //    }
            //});
        };
        LivePositionsComponent.prototype.updateZoneMeasurements = function (zone) {
            zone.widthMeasurement = this.getMeasurement(zone.width);
            zone.heightMeasurement = this.getMeasurement(zone.height);
        };
        LivePositionsComponent.prototype.bindDoorRotation = function () {
            var _this = this;
            var me = this;
            var door = $('.door');
            door.each(function (index) {
                var angle = me.extractAngle(me.doors[index].transform);
                $(this).rotatable({
                    angle: angle,
                    snap: true,
                    step: 90,
                    start: function () {
                        me.dragging = true;
                    },
                    stop: function () {
                        me.$timeout(function () {
                            me.dragging = false;
                        }, 10);
                    }
                });
            });
            var doorWrapper = $('.door-wrapper');
            doorWrapper.draggable({
                //containment: '#canvas-container',
                start: function (event, ui) {
                    _this.draggableStartAdjust(ui);
                },
                drag: function (event, ui) {
                    _this.draggableDragAdjust(ui);
                },
                stop: function (event, ui) {
                    var doors = _this.doors;
                    $('.door-wrapper').each(function (index) {
                        var pos = $(this).position();
                        doors[index].top = pos.top;
                        doors[index].left = pos.left;
                        doors[index].transform = me.getTransform($(this).find('.door'));
                    });
                }
            });
        };
        LivePositionsComponent.prototype.bindChairRotation = function () {
            var _this = this;
            var me = this;
            var chair = $('.chair');
            chair.each(function (index) {
                var angle = me.extractAngle(me.chairs[index].transform);
                $(this).rotatable({
                    snap: true,
                    step: 45,
                    angle: angle,
                    start: function () {
                        me.dragging = true;
                    },
                    stop: function () {
                        me.$timeout(function () {
                            me.dragging = false;
                        }, 10);
                    }
                });
            });
            var chairWrapper = $('.chair-wrapper');
            chairWrapper.draggable({
                //containment: '#canvas-container',
                start: function (event, ui) {
                    _this.draggableStartAdjust(ui);
                },
                drag: function (event, ui) {
                    _this.draggableDragAdjust(ui);
                },
                stop: function (event, ui) {
                    var chairs = this.chairs;
                    $('.chair-wrapper').each(function (index, element) {
                        var pos = $(this).position();
                        chairs[index].top = pos.top;
                        chairs[index].left = pos.left;
                        chairs[index].transform = me.getTransform($(this).find('.chair'));
                    });
                }
            });
        };
        LivePositionsComponent.prototype.onMeasurementChanged = function () {
            var _this = this;
            this.boundwidthMeasurement = this.getMeasurement(this.boundary.width);
            this.boundheightMeasurement = this.getMeasurement(this.boundary.height);
            this.zones.forEach(function (r) {
                r.widthMeasurement = _this.getMeasurement(r.width);
                r.heightMeasurement = _this.getMeasurement(r.height);
            });
            this.updateSensorRays();
            this.ruler.measurement = this.getMeasurement(this.ruler.width);
        };
        LivePositionsComponent.prototype.onConfigSourceChange = function () {
            this.getConfigurations();
        };
        LivePositionsComponent.$inject = [
            '$websocket',
            '$timeout',
            '$scope',
            'livePositionsService',
            '$document',
            '$location',
            '$window'
        ];
        return LivePositionsComponent;
    }());
    var measurementUnit;
    (function (measurementUnit) {
        measurementUnit[measurementUnit["Meters"] = 1] = "Meters";
        measurementUnit[measurementUnit["Feet"] = 2] = "Feet";
    })(measurementUnit || (measurementUnit = {}));
    var module = angular.module('wwxDemo');
    module.component('livePositions', {
        controller: LivePositionsComponent,
        templateUrl: '/app/live-positions/live-positions.component.html'
    });
})(WwxDemo || (WwxDemo = {}));
//# sourceMappingURL=live-positions.component.js.map