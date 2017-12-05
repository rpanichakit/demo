namespace WwxDemo {
    class LivePositionsComponent {
        private readonly feetPerMeter: number = 3.28;

        private positionOutputs: any[] = [];
        private deviceInfo: any[] = [];
        private dataStream: any;
        private zStream: any;
        private zextStream: any;
        private canvasContext: any;
        private canvasWidth: number;
        private canvasHeight: number;
        private mapPath: string;
        private mapPosition: any = { top: 0, left: 0 };
        private sensorPosition: any;
        private defaultTransform: string = 'rotate(0rad)'
        private sensorTransform: string = 'rotate(0rad)';
        private hasSensorRotate: boolean = true;
        private currentAngle: number = 0;
        private currentRad: number = 0;
        private pixelsPerMeter: number = 6000;
        private unitId: number = 8290;
        private radianStep = 0.00872665;
        private degreeStep = 0.5;
        private radiansPerDegree = 0.0174533;
        private scaleStep = 1;
        private unit: string = 'ft';
        private dotSize: number = 3;
        private unitOptions: any[] = [
            { name: 'den replay', id: 8290 },
            { name: 'traveling demo 1', id: 8303 }
        ];
        private mode: EditMode = EditMode.None;
        private boundaryTopLeft: any;
        private boundaryWidth: number = 0;
        private boundaryHeight: number = 0;
        private boundary: any;
        private boundaries: any[] = [];
        private newBoundary: any;
        private boundwidthMeasurement: number = 0;
        private boundheightMeasurement: number = 0;
        private chairs: any[] = [];
        private doors: any[] = [];
        private dragging: boolean = false;
        private zones: any[] = [];
        private newZone: any;
        private rectangles: any[] = [];
        private newRectangle;
        private northRay: any;
        private westRay: any;
        private eastRay: any;
        private southRay: any;
        private savedConfigurations: any[] = [];
        private configName = '';
        private configId = 0;
        private showSaveSuccess: boolean = false;
        private localStorageKey = 'iinsideConfigurations';
        private selectedDevice: any;
        private namedIds: any[] = [];
        private ruler: any;
        private measuring: boolean = false;
        private currentZone;
        private copiedZone;
        private configSource = 'file';
        private mousePosition: any = {};
        private undoStack = [];
        private undoIndex = 0;
        private showZones = true;
        private hasDatabase = true;
        private preTranslated = false;
        private currentZonesAnalysisConfig;
        private editingZone = false;
        private currentHandle;
        private currentBoundaryHandle;
        private resizingBoundary = false;
        // private socketAddress = 'ws://192.168.101.26:9393/positions';
        private socketAddress = 'wss://microsoftdemo.iinside.com:443/positions';
        // private socketAddress = 'wss://iisanalytics.iinside.com:9393/positions';

        private svgElement;
        private defs;
        private circlesG;
        private circles;
        private positions;
        private hideMenu = false;
        private shouldSubscribeToZones = false;
        private rotateStart;
        private rotateEnd;
        private draggingCanvas = false;
        private origRad;
        private origScale;
        private autoScale = true;
        private autoPosition = true;
        private mapOrigins;
        private zoomScale = 1;
        private zoomOrigin = '50% 50%';
        private viewScale = 1;
        private viewZoomOrigin = '50% 50%';
        private lockSensorScale = false;
        private lockSensorRotate = false;

        drawMode: string = 'canvas';

        glowDuration = 800;
        EditMode = EditMode;

        static $inject = [
            '$websocket',
            '$timeout',
            '$scope',
            'livePositionsService',
            '$document',
            '$location',
            '$window'
        ];
        constructor(
            private $websocket: any,
            private $timeout: ng.ITimeoutService,
            private $scope: ng.IScope,
            private service: LivePositionsService,
            private $document: ng.IDocumentService,
            private $location: ng.ILocationService,
            private $window: ng.IWindowService
        ) {
            this.init();
        }

        get showConfig() {
            return this.mode === EditMode.Config || this.mode === EditMode.Map || this.mode === EditMode.Boundary || (this.currentZone) || this.mode === EditMode.Save || this.mode === EditMode.Open || this.mode === EditMode.Ruler;
        }

        get graphColors() {
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

        }

        bindKeys() {
            this.$document.on('keydown', (e) => {
                this.$scope.$apply(() => {
                    if (e.target.tagName !== 'INPUT') {
                        if (e.ctrlKey) {
                            switch (e.key) {
                                case 'c':
                                    if (this.currentZone) {
                                        this.copiedZone = angular.copy(this.currentZone);
                                    }
                                    break;
                                case 'v':
                                    if (this.copiedZone) {
                                        this.storeUndo();
                                        let newZone = angular.copy(this.copiedZone);
                                        newZone.id = 'z' + (this.zones.length + 1);
                                        newZone.name = 'zone ' + (this.zones.length + 1);
                                        newZone.top = this.mousePosition.y;
                                        newZone.left = this.mousePosition.x;
                                        newZone.selected = false;
                                        this.zones.push(newZone);
                                        this.$timeout(() => {
                                            this.bindZones();
                                        }, 100);
                                    }
                                    break;
                                case 'z':
                                    this.undo();
                                    break;
                            }
                        }
                        if (this.mode === EditMode.Config) {
                            this.radianStep = this.degreeStep * this.radiansPerDegree;
                            const scaleStep = this.scaleStep * 100;
                            switch (e.key) {
                                case 'ArrowUp':
                                    this.changePixelsPerMeter(this.pixelsPerMeter + scaleStep);
                                    break;
                                case 'ArrowDown':
                                    this.changePixelsPerMeter(this.pixelsPerMeter - scaleStep);
                                    break;
                                case 'ArrowLeft':
                                    this.currentRad -= this.radianStep;
                                    this.currentAngle = this.getDegreesFromRadians(this.currentRad);
                                    this.sensorTransform = 'rotate(' + (this.currentRad * 180) / Math.PI + 'deg)';
                                    break;
                                case 'ArrowRight':
                                    this.currentRad += this.radianStep;
                                    this.currentAngle = this.getDegreesFromRadians(this.currentRad);
                                    this.sensorTransform = 'rotate(' + (this.currentRad * 180) / Math.PI + 'deg)';
                                    break;
                            }
                        }
                    }
                });

            });
        }

        createGlow() {
            let filter = this.defs
                .append('filter')
                .attr('height', '350%')
                .attr('width', '350%')
                .attr('x', '-100%')
                .attr('y', '-100%')
                .attr('id', 'glow');

            let stdDev = 6;
            let blur = filter
                .append("feGaussianBlur")
                .attr("class", "blur")
                .attr("stdDeviation", stdDev)
                .attr("result", "coloredBlur");

            let feMerge = filter.append("feMerge");
            feMerge
                .append("feMergeNode")
                .attr("in", "coloredBlur");
            feMerge
                .append("feMergeNode")
                .attr("in", "SourceGraphic");

            let blink = () => {
                if (stdDev == 6)
                    stdDev = 3
                else
                    stdDev = 6;
                blur.transition()
                    .duration(this.glowDuration)
                    .attr('stdDeviation', stdDev)
                    .each('end', blink);
            }

            blink();
        }

        touchHandler(event) {
            var touch = event.changedTouches[0];

            var simulatedEvent = document.createEvent("MouseEvent");
            simulatedEvent.initMouseEvent({
                touchstart: "mousedown",
                touchmove: "mousemove",
                touchend: "mouseup"
            }[event.type], true, true, window, 1,
                touch.screenX, touch.screenY,
                touch.clientX, touch.clientY, false,
                false, false, false, 0, null);

            touch.target.dispatchEvent(simulatedEvent);
            //event.preventDefault();
        }

        onAutoScaleChanged() {
            if (!this.autoScale) {
                let left = Math.round((this.canvasWidth / 2) - ($('#map').width() / 2)) + 'px';
                this.mapPosition = {
                    top: '50px',
                    left: left
                };
                $('#map').draggable('option', 'disabled', false);
            } else {
                this.mapPosition = {
                    top: '50%',
                    left: '50%'
                };
                $('#map').draggable('option', 'disabled', true);
            }
        }

        repositionItemWithinBoundary(item, ratio, origBoundary) {
            const boundaryLeft = (item.left - origBoundary.left) * ratio;
            const boundaryTop = (item.top - origBoundary.top) * ratio;
            item.left = this.boundary.left + boundaryLeft;
            item.top = this.boundary.top + boundaryTop;
        }

        onWindowResize() {
            this.canvasWidth = $('#canvas-container').width();
            this.canvasHeight = $('#canvas-container').height();
            if (this.autoScale && !this.mapOrigins && this.boundary) {
                const origBoundary = angular.copy(this.boundary);
                this.sizeBoundary();
                const ratio = this.boundary.width / origBoundary.width;
                this.repositionItemWithinBoundary(this.sensorPosition, ratio, origBoundary);
                this.zones.forEach(z => {
                    this.repositionItemWithinBoundary(z, ratio, origBoundary);
                });

                this.chairs.forEach(c => {
                    this.repositionItemWithinBoundary(c, ratio, origBoundary);
                });

                this.doors.forEach(d => {
                    this.repositionItemWithinBoundary(d, ratio, origBoundary);
                });

                this.rectangles.forEach(r => {
                    this.repositionItemWithinBoundary(r, ratio, origBoundary);
                })
                this.$timeout(() => {
                    this.updateSensorRays();
                },100);
            } else if (this.mapOrigins && this.autoScale) {
                const map = angular.element('#map');
                const newPos = map.position();
                newPos.top = newPos.top / this.zoomScale;
                newPos.left = newPos.left / this.zoomScale;
                const newWidth = map.width();
                const newHeight = map.height();
                const widthRatio = newWidth / this.mapOrigins.width;
                const heightRatio = newHeight / this.mapOrigins.height;
                const mapPosLeft = (this.sensorPosition.left - this.mapOrigins.position.left) * widthRatio;
                const mapPosTop = (this.sensorPosition.top - this.mapOrigins.position.top) * heightRatio;

                this.sensorPosition.left = newPos.left + mapPosLeft;
                this.sensorPosition.top = newPos.top + mapPosTop;

                if (this.boundary) {
                    this.repositionItem(this.boundary, widthRatio, newPos);
                }

                this.zones.forEach(z => {
                    this.repositionItem(z, widthRatio, newPos);
                });

                this.chairs.forEach(c => {
                    this.repositionItem(c, widthRatio, newPos);
                });

                this.doors.forEach(d => {
                    this.repositionItem(d, widthRatio, newPos);
                });

                this.rectangles.forEach(r => {
                    this.repositionItem(r, widthRatio, newPos);
                })

                //this.pixelsPerMeter = this.pixelsPerMeter * widthRatio;
                this.changePixelsPerMeter(this.pixelsPerMeter * widthRatio);
                //this.sensorPosition.top *= heightRatio;
                //this.sensorPosition.left *= widthRatio;
                this.mapOrigins = {
                    position: newPos,
                    width: newWidth,
                    height: newHeight
                };

                this.updateSensorRays();
            }

          
        }

        init() {
            document.addEventListener("touchstart", this.touchHandler, true);
            document.addEventListener("touchmove", this.touchHandler, true);
            document.addEventListener("touchend", this.touchHandler, true);
            document.addEventListener("touchcancel", this.touchHandler, true);

            angular.element(this.$window).on('resize', e => {
                this.onWindowResize();
            });

            this.bindKeys();

            let configurationData = localStorage.getItem(this.localStorageKey);
            this.savedConfigurations = configurationData ? JSON.parse(configurationData) : [];
            this.configName = 'demo_' + (this.savedConfigurations.length + 1);

            let canvas: any = document.getElementById('dots-canvas');
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

            this.$timeout(() => {
                let map: any = $('#map');
                map.on('mousewheel', (e: any) => {
                    if (this.mode === EditMode.Map && !this.autoScale) {
                        this.$scope.$apply(() => {
                            if (e.originalEvent.wheelDelta / 120 > 0) {
                                map.width(map.width() * 1.1);
                                map.height(map.height() * 1.1);
                            } else {
                                map.width(map.width() * .9);
                                map.height(map.height() * .9);
                            }
                        });
                    }
                });

                $('#canvas-container').on('mousewheel', (e: any) => {
                    if (this.hideMenu === true) {
                        this.$scope.$apply(() => {

                            if (e.originalEvent.wheelDelta / 120 > 0) {
                                this.zoomOrigin = e.clientX + 'px ' + e.clientY + 'px';
                                this.zoomScale += .2;
                            }
                            else {
                                if (this.zoomScale > .2) {
                                    this.zoomScale -= .2;
                                }
                            }
                            this.$timeout(() => {
                                this.mapOrigins = {
                                    position: {
                                        top: $('#map').position().top / this.zoomScale,
                                        left: $('#map').position().left / this.zoomScale
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
                    draggable: this.mode === EditMode.Config,
                    start: (event, ui) => {
                        this.draggableStartAdjust(ui);
                    },
                    drag: (event, ui) => {
                        this.draggableDragAdjust(ui);
                        const topDiff = ui.position.top - this.mapPosition.top;
                        const leftDiff = ui.position.left - this.mapPosition.left;
                        this.mapPosition = ui.position;
                        if (!isNaN(topDiff) && !isNaN(leftDiff)) {
                            this.$scope.$apply(() => {
                                if (!event.ctrlKey) {
                                    this.sensorPosition.top += topDiff;
                                    this.sensorPosition.left += leftDiff;
                                    this.zones.forEach(r => {
                                        r.top += topDiff;
                                        r.left += leftDiff;
                                    });
                                    this.chairs.forEach(c => {
                                        c.top += topDiff;
                                        c.left += leftDiff;
                                    });
                                    this.doors.forEach(d => {
                                        d.top += topDiff;
                                        d.left += leftDiff;
                                    });
                                    this.rectangles.forEach(r => {
                                        r.top += topDiff;
                                        r.left += leftDiff;
                                    });
                                }
                                this.updateSensorRays();
                            });
                        }
                    }
                });

                if (this.autoScale) {
                    $('#map').draggable('option', 'disabled', true);
                }

                let boundary: any = $('.room-boundary');
                boundary.draggable({
                    //containment: '#canvas-container',
                    delay: 200,
                    start: (event, ui) => {
                        this.draggableStartAdjust(ui);
                    },
                    drag: (event, ui) => {
                        this.draggableDragAdjust(ui);
                        const topDiff = ui.position.top - this.boundary.top;
                        const leftDiff = ui.position.left - this.boundary.left;
                        if (!isNaN(topDiff) && !isNaN(leftDiff)) {
                            this.$scope.$apply(() => {
                                if (!event.ctrlKey) {
                                    this.sensorPosition.top += topDiff;
                                    this.sensorPosition.left += leftDiff;
                                    this.zones.forEach(r => {
                                        r.top += topDiff;
                                        r.left += leftDiff;
                                    });
                                    this.chairs.forEach(c => {
                                        c.top += topDiff;
                                        c.left += leftDiff;
                                    });
                                    this.doors.forEach(d => {
                                        d.top += topDiff;
                                        d.left += leftDiff;
                                    });
                                    this.rectangles.forEach(r => {
                                        r.top += topDiff;
                                        r.left += leftDiff;
                                    });
                                }
                                this.boundary.top = ui.position.top;
                                this.boundary.left = ui.position.left;
                                this.updateSensorRays();
                            });
                        }
                    },
                    stop: (event, ui) => {

                    }
                });

                let sensor: any = $('#sensor');
                sensor.draggable({
                    //containment: '#canvas-container',
                    delay: 100,
                    start: (event, ui) => {
                        this.draggableStartAdjust(ui);
                        event.stopPropagation();
                    },
                    drag: (event, ui) => {
                        event.stopPropagation();
                        this.draggableDragAdjust(ui);
                        this.$scope.$apply(() => {
                            this.sensorPosition = ui.position;
                            this.updateSensorRays();
                        });
                    },
                    stop: (event, ui) => {
                        event.stopPropagation();
                        this.$scope.$apply(() => {
                            this.sensorPosition = ui.position;
                            this.updateSensorRays();
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

                $('#map-file').on('change', () => {
                    let inputFile: any = document.getElementById('map-file');
                    if (inputFile.files && inputFile.files[0]) {
                        let reader = new FileReader();
                        reader.onload = (e: any) => {
                            this.$scope.$apply(() => {
                                this.mapPath = e.target.result;
                                this.$timeout(() => {
                                    let left = Math.round((this.canvasWidth / 2) - ($('#map').width() / 2)) + 'px';
                                    if (this.autoScale) {
                                        this.mapPosition = {
                                            top: '50%',
                                            left: '50%'
                                        };
                                    } else {
                                        this.mapPosition = {
                                            top: '50px',
                                            left: left
                                        };
                                    }

                                    $('#map').css('top', this.mapPosition.top);
                                    $('#map').css('left', this.mapPosition.left);
                                    if (this.autoScale) {
                                        this.mapOrigins = {
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
            const configName = this.$location.search().config;
            const view = this.$location.search().view;
            if (configName) {
                this.service.getConfigs()
                    .then((configs: any) => {
                        this.savedConfigurations = configs.map(c => {
                            let data = c.data ? JSON.parse(c.data) : {}
                            data.configId = c.id;
                            return data;
                        });
                        let foundConfig = false;
                        this.savedConfigurations.forEach(c => {
                            if (c.name === configName) {
                                this.loadConfiguration(c);
                                foundConfig = true;
                            }
                        });
                        if (!foundConfig) {
                            this.connectToWebSocket();
                        }
                    });
            } else {
                this.connectToWebSocket();
            }
            if (view) {
                this.mode = EditMode.None;
                this.hideMenu = true;
            }
        }

        draggableStartAdjust(ui) {
            //ui.position.left = 0;
            //ui.position.top = 0;
        }

        draggableDragAdjust(ui) {
            //var changeLeft = ui.position.left - ui.originalPosition.left; // find change in left
            //var newLeft = ui.originalPosition.left + changeLeft / ((this.zoomScale)); // adjust new left by our zoomScale

            //var changeTop = ui.position.top - ui.originalPosition.top; // find change in top
            //var newTop = ui.originalPosition.top + changeTop / this.zoomScale; // adjust new top by our zoomScale

            //ui.position.left = newLeft;
            //ui.position.top = newTop;
        }

        logout() {
            window.location.href = '/AuthServices/Logout';
        }

        rotateByRad(origin, point, radians) {
            let cos = Math.cos(radians),
                sin = Math.sin(radians),
                dX = point.x - origin.x,
                dY = point.y - origin.y;

            return {
                x: cos * dX - sin * dY + origin.x,
                y: sin * dX + cos * dY + origin.y
            };
        }

        rotateByDegrees(origin, point, angle) {
            let radians = angle * Math.PI / 180.0;
            return this.rotateByRad(origin, point, radians);
        }

        subscribeToZonesAnalysis() {
            if (this.zStream) {
                this.zStream.send('zsub ' + this.configName);
            }
        }

        connectToWebSocket() {
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

            this.zextStream.onOpen(() => {
                // console.log('connected zextsub');
                this.zextStream.send('zextsub');
            });
            this.zextStream.onError((err) => {
                console.log(err);
            })
            this.zextStream.onMessage((message) => {
                const data = JSON.parse(message.data);
                // console.log(data);

                //this.rectangles.forEach(r => {
                //    const zoneInData = data.filter(d => d.ZoneId === r.id)[0];
                //    if (!zoneInData) {
                //        r.population = 0;
                //        r.occupied = false;
                //    }
                //});

                data.forEach(z => {
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

            this.zStream.onOpen(() => {
                console.log('connected zsub');
                if (this.shouldSubscribeToZones) {
                    this.subscribeToZonesAnalysis();
                }
            });
            this.zStream.onError((err) => {
                console.log(err);
            })
            this.zStream.onMessage((message) => {
                const data = JSON.parse(message.data);
                // console.log(data);
                this.zones.forEach(r => {
                    if (r.id === data.zoneId) {
                        r.occupied = data.status;
                        r.population = data.countExceedingDwell;
                        if (r.occupied) {
                            // console.log(data.ZoneId + ' is occupied.');
                        }
                    }
                });

            });

            this.dataStream.onOpen(() => {

                if (this.preTranslated) {
                    console.log('connected jsub');
                    this.dataStream.send('jsub office_lidar');
                } else {
                    console.log('connected SUB');
                    this.dataStream.send('SUB ' + this.unitId);
                }
            })

            this.dataStream.onClose((event) => {
                console.log(event);
            });
            this.dataStream.onError((err) => {
                console.log(err);
            })
            this.dataStream.onMessage((message) => {
                var reader = new FileReader();
                reader.onload = (evt) => {
                    var dv = new DataView(reader.result);
                    var retVal = "";
                    this.positionOutputs = [];

                    for (var i = 0; i < dv.byteLength / 6; i++) {
                        var j = i * 6;
                        let x, y;
                        if (!this.preTranslated) {
                            //console.log('x:' + dv.getInt16(j + 2, true) + ',y:' + dv.getInt16(j + 4, true));
                            x = Math.round(((dv.getInt16(j + 2, true) / 100) * (this.pixelsPerMeter / 100)) + this.sensorPosition.left);
                            y = Math.round(((dv.getInt16(j + 4, true) / 100) * (this.pixelsPerMeter / 100)) + this.sensorPosition.top);

                        } else {
                            x = dv.getInt16(j + 2, true);
                            y = dv.getInt16(j + 4, true);
                        }

                        let output: any = {
                            deviceId: dv.getUint16(j, true),
                            x: x,
                            y: y,
                            xCentimeters: dv.getInt16(j + 2, true),
                            yCentimeters: dv.getInt16(j + 4, true),
                            color: this.getColorByDeviceId(dv.getUint16(j, true)),
                            name: false
                        };

                        if (!this.preTranslated) {
                            let origin = {
                                x: this.sensorPosition.left,
                                y: this.sensorPosition.top
                            };
                            let newPoint = this.rotateByRad(origin, output, this.currentRad);
                            output.x = newPoint.x;
                            output.y = newPoint.y;
                        }

                        //let existingName = this.namedIds.filter((n) => { return n.id === output.deviceId; })[0];
                        //if (existingName) {
                        //    output.name = existingName.name;
                        //}
                        if (this.selectedDevice && output.deviceId === this.selectedDevice.id) {
                            const distance = Math.round((Math.sqrt(Math.pow(output.xCentimeters, 2) + Math.pow(output.yCentimeters, 2)))/100) + 'm';
                            output.name = distance;
                        }

                        this.positionOutputs.push(output);
                    }
                    //console.log(new Date() + '-' + this.positionOutputs.length);
                    this.draw();
                };
                reader.readAsArrayBuffer(message.data);
            });
        }

        getColorByDeviceId(deviceId) {
            let deviceColor;
            let info = this.deviceInfo.filter((d) => {
                return d.deviceId === deviceId;
            })[0];
            if (!info) {
                let index = this.deviceInfo.length <= 23 ? this.deviceInfo.length : this.deviceInfo.length % 23;
                let color = this.graphColors[index];
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
        }

        draw() {
            let lineWidth = Math.round((4 / (6000 / this.pixelsPerMeter)) * this.zoomScale);
            lineWidth = lineWidth > 0 ? lineWidth : 1;
            const radius = Math.round(((this.pixelsPerMeter / 100) / 4) * this.zoomScale);

            if (this.drawMode === 'canvas') {
                this.canvasContext.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

                let blur = Math.round((38 / (6000 / this.pixelsPerMeter)) * this.zoomScale);
                this.positionOutputs.forEach((d) => {
                    this.canvasContext.beginPath();
                    this.canvasContext.arc(Math.round(d.x), Math.round(d.y), radius, 0, 2 * Math.PI);
                    this.canvasContext.lineWidth = lineWidth;
                    this.canvasContext.strokeStyle = d.color;
                    this.canvasContext.shadowBlur = radius;
                    this.canvasContext.shadowColor = d.color;
                    this.canvasContext.stroke();
                });

            } else if (this.drawMode === 'svg') {
                this.circles = this.circlesG
                    .selectAll('circle')
                    .data(this.positionOutputs, d => {
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
                    .attr('cx', (d) => {
                        return d.x;
                    })
                    .attr('cy', (d) => {
                        return d.y;
                    })
                    .style('stroke', (d) => { return d.color; })
                    .style('stroke-width', lineWidth)
                    .attr('r', radius);

            } else {
                this.positions = this.positionOutputs.map(o => {
                    return {
                        deviceId: o.deviceId,
                        name: o.name,
                        width: radius * 2,
                        height: radius * 2,
                        top: o.y - radius,
                        left: o.x - radius,
                        border: lineWidth + 'px solid ' + o.color,
                        borderRadius: radius * 2,
                        glow: `0px 1px ${radius}px rgba(${o.rgb.r}, ${o.rgb.g}, ${o.rgb.b}, 0.5) inset, 0px 0px ${radius * 2}px rgba(${o.rgb.r}, ${o.rgb.g}, ${o.rgb.b}, 0.5)`
                    }
                });
            }
        }

        hexToRgb(hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        }

        onUnitIdChanged() {
            this.canvasContext.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
            this.connectToWebSocket();
        }

        hideToolbar() {
            this.mode = EditMode.View;
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
        }

        showToolbar() {
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
        }

        selectMode(mode) {
            if (this.mode === mode) {
                this.mode = EditMode.None;
            } else {
                this.mode = mode;
            }

            switch (mode) {
                case EditMode.Map:
                    if (!this.autoScale) {
                        $('#map').draggable('option', 'disabled', false);
                    }
                    break;
            }
        }

        selectConfigMode() {
            if (this.mode == EditMode.Config) {
                this.mode = EditMode.None;
            }
            else {
                this.mode = EditMode.Config;
            }
            $('#map').draggable('option', 'disabled', true);
        }

        selectRulerMode() {
            if (this.mode == EditMode.Ruler) {
                this.mode = EditMode.None;
            }
            else {
                this.mode = EditMode.Ruler;
            }
        }

        selectBoundaryMode() {
            if (this.mode == EditMode.Boundary) {
                this.mode = EditMode.None;
            }
            else {
                this.mode = EditMode.Boundary;
            }
        }

        selectChairsMode() {
            if (this.mode == EditMode.Chairs) {
                this.mode = EditMode.None;
            }
            else {
                this.mode = EditMode.Chairs;
            }
        }

        selectZoneMode() {
            if (this.mode == EditMode.Zone) {
                this.mode = EditMode.None;
            }
            else {
                this.mode = EditMode.Zone;
            }
        }

        selectRectMode() {
            if (this.mode == EditMode.Rectangle) {
                this.mode = EditMode.None;
            }
            else {
                this.mode = EditMode.Rectangle;
            }
        }

        selectDoorMode() {
            if (this.mode == EditMode.Doors) {
                this.mode = EditMode.None;
            }
            else {
                this.mode = EditMode.Doors;
            }
        }

        selectSaveMode() {
            if (this.mode == EditMode.Save) {
                this.mode = EditMode.None;
            }
            else {
                this.mode = EditMode.Save;
                this.deselectZone();
            }
        }

        selectOpenMode() {
            if (this.mode == EditMode.Open) {
                this.mode = EditMode.None;
            }
            else {
                this.mode = EditMode.Open;
                this.deselectZone();
            }
            this.getConfigurations();
        }

        deselectZone() {
            this.currentZone = undefined;
            this.zones.forEach(r => {
                r.selected = false;
            });
        }

        handleMouseDown(handle, event) {
            this.currentHandle = handle;
            event.stopPropagation();
        }

        boundaryHandleMouseDown(handle, event) {
            this.currentBoundaryHandle = handle;
            this.resizingBoundary = true;
            event.stopPropagation();
        }

        canvasMouseDown(event) {
            if (this.mode === EditMode.Config && !this.draggingCanvas && (!this.lockSensorScale || !this.lockSensorRotate)) {
                this.rotateStart = { x: event.clientX, y: event.clientY };
                this.origRad = this.currentRad; //this.getRadiansFromPoints(this.sensorPosition,this.rotateStart);
                this.origScale = this.pixelsPerMeter;
                this.draggingCanvas = true;
            }
        }

        canvasMouseUp(event) {
            if (this.currentHandle) {
                this.currentHandle = undefined;
            }
            if (this.currentBoundaryHandle) {
                this.currentBoundaryHandle = undefined;
                this.$timeout(() => {
                    this.resizingBoundary = false;
                },300);
            }
            if (this.draggingCanvas) {
                this.draggingCanvas = false;
            }
            //$event.stopPropagation();
        }

        canvasClicked(event) {
            this.deselectZone();
            if (this.mode === EditMode.Boundary && !this.resizingBoundary) {
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
            else if (this.mode === EditMode.Rectangle) {
                if (!this.newRectangle) {
                    this.newRectangle = {
                        top: event.clientY,
                        left: event.clientX,
                        origTop: event.clientY,
                        origLeft: event.clientX,
                    };
                } else {
                    this.rectangles.push(angular.copy(this.newRectangle));
                    this.newRectangle = false;
                    this.$timeout(() => {
                        this.bindRectangles();
                    }, 1);
                }
            }
            else if (this.mode === EditMode.Zone) {
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
                        this.$timeout(() => {
                            this.bindZones();
                        }, 1);
                    }
                } else {
                    this.deselectZone();
                }
            }
            else if (this.mode === EditMode.Chairs) {
                if (!this.dragging) {
                    let width = Math.round((this.pixelsPerMeter / 100) * .75);

                    this.chairs.push({
                        top: event.clientY - Math.round(width / 2),
                        left: event.clientX - Math.round(width / 2),
                        width: width,
                        transform: this.defaultTransform
                    });

                    this.$timeout(() => {
                        let chair: any = $('.chair');
                        chair.rotatable({
                            snap: true,
                            step: 45,
                            start: () => {
                                this.dragging = true;
                            },
                            stop: () => {
                                this.$timeout(() => {
                                    this.dragging = false;
                                }, 10);
                            }
                        });
                        let chairWrapper: any = $('.chair-wrapper');
                        let me = this;
                        chairWrapper.draggable({
                            //containment: '#canvas-container',
                            start: (event, ui) => {
                                this.draggableStartAdjust(ui);
                            },
                            drag: (event, ui) => {
                                this.draggableDragAdjust(ui);
                            },
                            stop: function (event, ui) {
                                let chairs = me.chairs;
                                $('.chair-wrapper').each(function (index, element) {
                                    let pos = $(this).position();
                                    chairs[index].top = pos.top;
                                    chairs[index].left = pos.left;
                                    chairs[index].transform = me.getTransform($(this).find('.chair'));
                                });
                            }
                        });
                    });
                }
            }
            else if (this.mode === EditMode.Doors) {
                if (!this.dragging) {
                    let width = Math.round((this.pixelsPerMeter / 100) * .8128);

                    this.doors.push({
                        top: event.clientY - Math.round(width / 2),
                        left: event.clientX - Math.round(width / 2),
                        width: width,
                        transform: this.defaultTransform
                    });

                    this.$timeout(() => {
                        let door: any = $('.door');
                        door.rotatable({
                            snap: true,
                            step: 90,
                            start: () => {
                                this.dragging = true;
                            },
                            stop: () => {
                                this.$timeout(() => {
                                    this.dragging = false;
                                }, 10);
                            }
                        });
                        let doorWrapper: any = $('.door-wrapper');
                        let me = this;
                        doorWrapper.draggable({
                            //containment: '#canvas-container',
                            start: (event, ui) => {
                                this.draggableStartAdjust(ui);
                            },
                            drag: (event, ui) => {
                                this.draggableDragAdjust(ui);
                            },
                            stop: (event, ui) => {
                                let doors = this.doors;
                                $('.door-wrapper').each(function (index) {
                                    let pos = $(this).position();
                                    doors[index].top = pos.top;
                                    doors[index].left = pos.left;
                                    doors[index].transform = me.getTransform($(this).find('.door'));
                                });
                            }
                        });
                    });
                }
            }
            else if (this.mode === EditMode.None || this.mode === EditMode.Config) {
                let radius = Math.round((this.pixelsPerMeter / 100) / 4);
                let hitTarget = false;
                this.positionOutputs.forEach((p) => {
                    let top = p.y - radius;
                    let bottom = p.y + radius;
                    let left = p.x - radius;
                    let right = p.x + radius;
                    if (event.clientX >= left && event.clientX <= right && event.clientY >= top && event.clientY <= bottom) {
                        let existing = this.namedIds.filter((n) => {
                            return n.id === p.deviceId;
                        })[0];
                        if (this.mode === EditMode.None) {
                            if (!existing) {
                                this.selectedDevice = {
                                    id: p.deviceId,
                                    name: p.deviceId
                                };
                                this.namedIds.push(this.selectedDevice);
                            }
                            else {
                                this.selectedDevice = existing;
                            }
                        } else {
                            const distance = Math.round(Math.sqrt(Math.pow(p.xCentimeters, 2) + Math.pow(p.yCentimeters, 2))*10/10) + 'cm';
                            this.selectedDevice = {
                                id: p.deviceId,
                                name: distance
                            }
                        }
                        hitTarget = true;
                    }
                });
                if (!hitTarget) {
                    this.selectedDevice = false;
                }
            }
            else if (this.mode == EditMode.Ruler) {
                if (!this.measuring) {
                    let angle = Math.atan2(50, 0) * 180 / Math.PI;
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
        }

        updateBoundaryHandles() {
            this.boundary.handles.forEach(h => {
                switch (h.class) {
                    case 'top-left':
                        h.top = -5;
                        h.left = -5;
                        break;
                    case 'top-right':
                        h.top = -5;
                        h.left = this.boundary.width - 5;
                        break;
                    case 'bottom-right':
                        h.top = this.boundary.height - 5;
                        h.left = this.boundary.width - 5;
                        break;
                    case 'bottom-left':
                        h.top = this.boundary.height - 5;
                        h.left = -5;
                        break;
                }
            });
        }

        updateZoneHandles(zone) {
            zone.handles.forEach(h => {
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
        }

        getDotLabelPosition(dot) {
            let radius = Math.round((this.pixelsPerMeter / 100) / 4);
            return {
                top: (dot.y - radius - 20) + 'px',
                left: (dot.x) + 'px'
            };
        }

        getMeasurement(pixels) {
            let measurement = pixels / (this.pixelsPerMeter / 100);
            if (this.unit === 'ft') {
                measurement = measurement * this.feetPerMeter;
            }
            return Math.round(measurement * 10) / 10;
        }



        getRadiansFromPoints(p1, p2) {
            return Math.atan2(p2.y - p1.y, p2.x - p1.x);
        }

        getAngleFromPoints(p1, p2) {
            return (this.getRadiansFromPoints(p1, p2) * 180) / Math.PI;
        }

        getDistanceFromPoints(p1, p2) {
            return Math.sqrt((Math.pow(p2.x - p1.x, 2)) + (Math.pow(p2.y - p1.y, 2)));
        }

        changePixelsPerMeter(ppm) {
            this.pixelsPerMeter = ppm;
            this.onScaleChanged();
        }

        getDegreesFromRadians(rad) {
            return Math.round(((rad * 180) / Math.PI) * 100) / 100;
        }

        onRotationChanged() {
            this.currentRad = this.currentAngle * Math.PI / 180;
            this.sensorTransform = 'rotate(' + this.currentAngle + 'deg)';
        }

        canvasMouseMove(event) {
            this.mousePosition = {
                x: event.clientX,
                y: event.clientY
            };

            if (this.draggingCanvas) {
                this.rotateEnd = this.mousePosition;
                //const angle = this.getAngleFromPoints(this.rotateStart, this.rotateEnd);
                const sensorPos = {
                    x: this.sensorPosition.left,
                    y: this.sensorPosition.top
                };
                const radians = this.getRadiansFromPoints(sensorPos, this.rotateEnd);
                const radianStart = this.getRadiansFromPoints(sensorPos, this.rotateStart);
                const radDiff = radians - radianStart;

                const distance = this.getDistanceFromPoints(sensorPos, this.rotateEnd);
                const startDistance = this.getDistanceFromPoints(sensorPos, this.rotateStart);
                const distRatio = distance / startDistance;

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
                const bottom = this.currentZone.height + this.currentZone.top;
                const right = this.currentZone.width + this.currentZone.left;
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
            } else if (this.currentBoundaryHandle) {
                const bottom = this.boundary.height + this.boundary.top;
                const right = this.boundary.width + this.boundary.left;
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
            } else {

                if (this.mode === EditMode.Boundary && this.newBoundary) {
                    if (event.clientX < this.newBoundary.origLeft && event.clientY < this.newBoundary.origTop) {
                        this.newBoundary.top = event.clientY;
                        this.newBoundary.left = event.clientX;
                        this.newBoundary.width = this.newBoundary.origLeft - event.clientX;
                        this.newBoundary.height = this.newBoundary.origTop - event.clientY;
                    } else if (event.clientY < this.newBoundary.origTop) {
                        this.newBoundary.top = event.clientY;
                        this.newBoundary.left = this.newBoundary.origLeft;
                        this.newBoundary.width = event.clientX - this.newBoundary.origLeft;
                        this.newBoundary.height = this.newBoundary.origTop - event.clientY;
                    } else if (event.clientX < this.newBoundary.origLeft) {
                        this.newBoundary.top = this.newBoundary.origTop;
                        this.newBoundary.left = event.clientX;
                        this.newBoundary.width = this.newBoundary.origLeft - event.clientX;
                        this.newBoundary.height = event.clientY - this.newBoundary.origTop;
                    } else {
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
                else if (this.mode === EditMode.Rectangle && this.newRectangle) {
                    if (event.clientX < this.newRectangle.origLeft && event.clientY < this.newRectangle.origTop) {
                        this.newRectangle.top = event.clientY;
                        this.newRectangle.left = event.clientX;
                        this.newRectangle.width = this.newRectangle.origLeft - event.clientX;
                        this.newRectangle.height = this.newRectangle.origTop - event.clientY;
                    } else if (event.clientY < this.newRectangle.origTop) {
                        this.newRectangle.top = event.clientY;
                        this.newRectangle.left = this.newRectangle.origLeft;
                        this.newRectangle.width = event.clientX - this.newRectangle.origLeft;
                        this.newRectangle.height = this.newRectangle.origTop - event.clientY;
                    } else if (event.clientX < this.newRectangle.origLeft) {
                        this.newRectangle.top = this.newRectangle.origTop;
                        this.newRectangle.left = event.clientX;
                        this.newRectangle.width = this.newRectangle.origLeft - event.clientX;
                        this.newRectangle.height = event.clientY - this.newRectangle.origTop;
                    } else {
                        this.newRectangle.top = this.newRectangle.origTop;
                        this.newRectangle.left = this.newRectangle.origLeft;
                        this.newRectangle.width = Math.abs(event.clientX - this.newRectangle.left);
                        this.newRectangle.height = Math.abs(event.clientY - this.newRectangle.top);
                    }

                    this.newRectangle.widthMeasurement = this.getMeasurement(this.newRectangle.width);
                    this.newRectangle.heightMeasurement = this.getMeasurement(this.newRectangle.height);
                }
                else if (this.mode === EditMode.Zone && this.newZone) {
                    if (event.clientX < this.newZone.origLeft && event.clientY < this.newZone.origTop) {
                        this.newZone.top = event.clientY;
                        this.newZone.left = event.clientX;
                        this.newZone.width = this.newZone.origLeft - event.clientX;
                        this.newZone.height = this.newZone.origTop - event.clientY;
                    } else if (event.clientY < this.newZone.origTop) {
                        this.newZone.top = event.clientY;
                        this.newZone.left = this.newZone.origLeft;
                        this.newZone.width = event.clientX - this.newZone.origLeft;
                        this.newZone.height = this.newZone.origTop - event.clientY;
                    } else if (event.clientX < this.newZone.origLeft) {
                        this.newZone.top = this.newZone.origTop;
                        this.newZone.left = event.clientX;
                        this.newZone.width = this.newZone.origLeft - event.clientX;
                        this.newZone.height = event.clientY - this.newZone.origTop;
                    } else {
                        this.newZone.top = this.newZone.origTop;
                        this.newZone.left = this.newZone.origLeft;
                        this.newZone.width = Math.abs(event.clientX - this.newZone.left);
                        this.newZone.height = Math.abs(event.clientY - this.newZone.top);
                    }

                    this.newZone.widthMeasurement = this.getMeasurement(this.newZone.width);
                    this.newZone.heightMeasurement = this.getMeasurement(this.newZone.height);
                }
                else if (this.mode === EditMode.Ruler && this.ruler && this.measuring) {
                    let distance = this.getDistance(this.ruler.left, this.ruler.top, event.clientX, event.clientY);
                    let angle = this.getAngle(this.ruler.left, this.ruler.top, event.clientX, event.clientY);
                    this.ruler.width = distance;
                    this.ruler.transform = 'rotate(' + angle + 'deg)';
                    this.ruler.measurement = this.getMeasurement(distance);
                }
            }
        }

        getDistance(x1, y1, x2, y2) {
            return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
        }

        getAngle(x1, y1, x2, y2) {
            return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        }

        onSocketAddressChanged() {
            this.connectToWebSocket();
        }

        onScaleChanged() {
            //if (this.boundary) {
            //    this.boundwidthMeasurement = this.getMeasurement(this.boundary.width);
            //    this.boundheightMeasurement = this.getMeasurement(this.boundary.height);
            //}
            this.chairs.forEach((c) => {
                c.width = Math.round((this.pixelsPerMeter / 100) * .75);
            });
            this.doors.forEach((c) => {
                c.width = Math.round((this.pixelsPerMeter / 100) * .8128);
            });
            this.zones.forEach(zone => {
                zone.width = this.getPixels(zone.widthMeasurement);
                zone.height = this.getPixels(zone.heightMeasurement);
            });
            this.rectangles.forEach(r => {
                r.width = this.getPixels(r.widthMeasurement);
                r.height = this.getPixels(r.heightMeasurement);
            });
            if (this.boundary) {
                this.boundary.width = this.getPixels(this.boundwidthMeasurement);
                this.boundary.height = this.getPixels(this.boundheightMeasurement);
                this.updateBoundaryHandles();
            }
        }

        repositionItem(item, ratio, mapPos) {
            const mapLeft = (item.left - this.mapOrigins.position.left) * ratio;
            const mapTop = (item.top - this.mapOrigins.position.top) * ratio;
            item.left = mapPos.left + mapLeft;
            item.top = mapPos.top + mapTop;
        }

        deleteZone(index, event) {
            this.zones.splice(index, 1);
            this.currentZone = undefined;
            event.stopPropagation();
        }

        deleteRectangle(index, event) {
            this.rectangles.splice(index, 1);
            event.stopPropagation();
        }

        stopClick(event) {
            if (this.mode != EditMode.None) {
                event.stopPropagation();
            }
        }

        sensorClicked(event) {
            event.stopPropagation();
        }

        sensorMouseDown(event) {
            event.stopPropagation();
        }

        selectZone(event, zone) {
            event.stopPropagation();
        }

        mouseDownZone(event, zone) {
            event.stopPropagation();
            this.zones.forEach(r => {
                if (r.id === zone.id) {
                    r.selected = true;
                } else {
                    r.selected = false;
                }
            });
            this.currentZone = zone;
        }

        deleteChair(index, event) {
            this.chairs.splice(index, 1);
            event.stopPropagation();
        }

        deleteDoor(index, event) {
            this.doors.splice(index, 1);
            event.stopPropagation();
        }

        getPixels(measurement) {
            let pixels = measurement * (this.pixelsPerMeter / 100);
            if (this.unit === 'ft') {
                pixels = pixels / this.feetPerMeter;
            }
            return Math.round(pixels);
        }

        onRulerMeasurementChanged() {
            let measurement = +this.ruler.measurement;
            if (this.unit === 'ft') {
                measurement = measurement / this.feetPerMeter
            }
            this.changePixelsPerMeter(Math.round((this.ruler.width / measurement) * 100));
        }

        sizeBoundary() {
            let pixelWidth = this.getPixels(this.boundwidthMeasurement);
            let pixelHeight = this.getPixels(this.boundheightMeasurement);
            let availableWidth = this.canvasWidth - 265;
            let availableHeight = this.canvasHeight - 100;
            if (pixelWidth >= pixelHeight || pixelWidth > availableWidth) {
                //if (pixelWidth > availableWidth) {
                let widthMeasurement = this.unit === 'm' ? this.boundwidthMeasurement : (this.boundwidthMeasurement / this.feetPerMeter);
                this.pixelsPerMeter = Math.round((availableWidth / widthMeasurement) * 100);
                pixelWidth = this.getPixels(this.boundwidthMeasurement);
                pixelHeight = this.getPixels(this.boundheightMeasurement);
                //}
            }
            if (pixelHeight > pixelWidth || pixelHeight > availableHeight) {

                //if (pixelHeight > availableHeight) {
                let heightMeasurement = this.unit === 'm' ? this.boundheightMeasurement : (this.boundheightMeasurement / this.feetPerMeter);
                this.pixelsPerMeter = Math.round((availableHeight / heightMeasurement) * 100);
                pixelWidth = this.getPixels(this.boundwidthMeasurement);
                pixelHeight = this.getPixels(this.boundheightMeasurement);
                //}
            }
            let left = Math.round((this.canvasWidth / 2) - (pixelWidth / 2));
            let top = Math.round((this.canvasHeight / 2) - (pixelHeight / 2));

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
        }

        onBoundarySizeChanged() {
            this.boundwidthMeasurement = +this.boundwidthMeasurement;
            this.boundheightMeasurement = +this.boundheightMeasurement;
            if (this.boundwidthMeasurement != 0 && this.boundheightMeasurement != 0) {
                this.sizeBoundary();
                this.updateSensorRays();
            }
        }

        isSensorInBoundary() {
            if (!this.boundary) {
                return false;
            }
            let boundaryBottom = this.boundary.top + this.boundary.height;
            let boundaryRight = this.boundary.left + this.boundary.width;

            return this.sensorPosition.left >= this.boundary.left && this.sensorPosition.left < boundaryRight && this.sensorPosition.top >= this.boundary.top && this.sensorPosition.top < boundaryBottom;
        }

        updateSensorRays() {
            if (!this.isSensorInBoundary()) {
                this.clearRays();
                return;
            }

            let sensorPosition = $('#sensor').position();
            let rayHeight = $('#sensor').position().top - this.boundary.top;

            this.northRay = {
                top: ($('#sensor').position().top - this.boundary.top) * -1,
                left: 0,
                width: 2,
                height: $('#sensor').position().top - this.boundary.top,
                measurementTop: Math.round((($('#sensor').position().top - this.boundary.top) * -1) / 2),
                measurement: this.getMeasurement(rayHeight)
            };

            let rayWidth = sensorPosition.left - this.boundary.left;
            let rayLeft = (rayWidth) * -1;

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
            }

            rayWidth = (this.boundary.left + this.boundary.width) - sensorPosition.left;

            this.eastRay = {
                top: 0,
                left: 0,
                width: rayWidth,
                height: 2,
                measurementTop: -20,
                measurementLeft: Math.round(rayWidth / 2) - 30,
                measurement: this.getMeasurement(rayWidth)
            }
        }

        clearMap() {
            this.mapPath = undefined;
            $('#map-file').val('');
        }

        clearBoundary() {
            this.boundary = false;
            this.boundheightMeasurement = 0;
            this.boundwidthMeasurement = 0;
            this.clearRays();
        }

        clearRays() {
            this.northRay = false;
            this.eastRay = false;
            this.southRay = false;
            this.westRay = false;
        }

        clearChairs() {
            this.chairs = [];
        }

        clearRectangles() {
            this.zones = [];
        }

        clearDoors() {
            this.doors = [];
        }

        clearScreen() {
            this.clearBoundary();
            this.clearChairs();
            this.clearRectangles();
            this.clearDoors();
            this.currentZone = undefined;
        }

        getTransform(element) {
            return element.attr('style').replace('transform: ', '').replace(';', '');
        }

        getCurrentConfiguration() {
            const me = this;

            if (this.boundary) {
                this.boundary.top = $('.room-boundary').position().top;
                this.boundary.left = $('.room-boundary').position().left;
            }

            let chairs = this.chairs;
            $('.chair-wrapper').each(function (index, element) {
                let pos = $(this).position();
                chairs[index].top = pos.top;
                chairs[index].left = pos.left;
                chairs[index].transform = me.getTransform($(this).find('.chair'));
            });

            let rectangles = this.rectangles;
            $('.rect').each(function (index, el) {
                let pos = $(this).position();
                rectangles[index].top = pos.top;
                rectangles[index].left = pos.left;
            });

            let zones = this.zones;
            $('.rectangle').each(function (index) {
                let pos = $(this).position();
                zones[index].top = Math.round(pos.top);
                zones[index].left = Math.round(pos.left);
                zones[index].width = Math.round(zones[index].width);
                zones[index].height = Math.round(zones[index].height);
            });

            let doors = this.doors;
            $('.door-wrapper').each(function (index) {
                let pos = $(this).position();
                doors[index].top = pos.top;
                doors[index].left = pos.left;
                doors[index].transform = me.getTransform($(this).find('.door'));
            });

            let currentConfiguration: any = {
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
                chairs,
                zones: zones,
                doors,
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
        }

        saveToBrowser(currentConfiguration) {
            let configurationData = localStorage.getItem(this.localStorageKey);
            let savedConfigurations = configurationData ? JSON.parse(configurationData) : [];
            let existingConfig = savedConfigurations.filter((c) => {
                return c.name === this.configName;
            })[0];
            if (!existingConfig) {
                savedConfigurations.push(currentConfiguration);
            }
            else {
                for (let i = 0; i < savedConfigurations.length; i++) {
                    if (savedConfigurations[i].name === currentConfiguration.name) {
                        savedConfigurations[i] = currentConfiguration;
                    }
                }
            }
            localStorage.setItem(this.localStorageKey, JSON.stringify(savedConfigurations));
            this.showSaveSuccess = true;
            this.$timeout(() => {
                this.showSaveSuccess = false;
            }, 1000);
        }

        saveToDatabase(currentConfiguration) {
            return this.service.insertConfig({
                name: currentConfiguration.name,
                data: JSON.stringify(currentConfiguration)
            });
        }

        publishConfigurationChanged() {
            this.dataStream.send('update_config ' + this.configName);
            if (this.configName !== this.currentZonesAnalysisConfig) {
                this.subscribeToZonesAnalysis();
                this.currentZonesAnalysisConfig = this.configName;
            }
        }

        saveConfiguration() {
            const currentConfiguration = this.getCurrentConfiguration();
            if (this.hasDatabase) {
                this.saveToDatabase(currentConfiguration)
                    .then((success: any) => {
                        if (success) {
                            this.saveToBrowser(currentConfiguration);
                            this.shouldSubscribeToZones = true;
                            this.publishConfigurationChanged();
                            this.zones.forEach(r => {
                                r.occupied = false;
                                r.population = 0;
                            });
                        }
                    });
            } else {
                this.saveToBrowser(currentConfiguration);
            }
        }

        export() {
            const currentConfiguration = this.getCurrentConfiguration();
            let a = document.createElement('a');
            let text = JSON.stringify(currentConfiguration);
            let file = new Blob([text], { type: 'text/plain' });
            a.href = URL.createObjectURL(file);
            let now = new Date();
            let month = now.getMonth() + 1;
            let timeStr = now.getFullYear() + '_' + month + '_' + now.getDate();
            a.download = currentConfiguration.name + '_' + timeStr + '.json';
            a.click();
        }

        getConfigurations() {
            if (this.configSource === 'browser') {
                let configurationData = localStorage.getItem(this.localStorageKey);
                this.savedConfigurations = configurationData ? JSON.parse(configurationData) : [];
            } else {
                this.service.getConfigs()
                    .then((configs: any) => {
                        this.savedConfigurations = configs.map(c => {
                            let data = c.data ? JSON.parse(c.data) : {}
                            data.configId = c.id;
                            return data;
                        });
                    });
            }
        }

        loadConfig(config) {
            this.service.getConfigs()
                .then((configs: any) => {
                    const matched = configs.filter(c => c.name === config.name)[0];
                    if (matched) {
                        const data = matched.data ? JSON.parse(matched.data) : {};
                        this.loadConfiguration(data, true);
                    }
                });
        }

        loadConfiguration(config, clean?) {
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
            this.zones.forEach(r => {
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
                this.$timeout(() => {
                    if (!this.mapOrigins) {
                        this.mapOrigins = {
                            position: $('#map').position(),
                            width: $('#map').width(),
                            height: $('#map').height()
                        };
                    }
                    this.autoScale = true;
                    this.mapPosition = {
                        top: '50%',
                        left: '50%'
                    };
                    this.$timeout(() => {
                        this.onWindowResize();
                    }, 10);
                }, 10);
            }

            this.canvasContext.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
            this.connectToWebSocket();
            this.hasSensorRotate = false;
            console.log(this);
          
            this.$timeout(() => {
                this.hasSensorRotate = true;
                this.$timeout(() => {
                    this.updateSensorRays();
                    this.bindChairRotation();
                    this.bindDoorRotation();
                    this.bindSensorRotation();
                    this.bindZones();
                    this.bindRectangles();
                }, 10);
            }, 10);
            this.shouldSubscribeToZones = true;
            this.subscribeToZonesAnalysis();
            this.$location.search('config', this.configName);
            // this.publishConfigurationChanged();
        }

        extractAngle(transform) {
            return +transform.replace('rotate(', '').replace('rad)', '');
        }

        bindSensorRotation() {
            //let rotate: any = $('#rotate');
            //rotate.rotatable({
            //    angle: this.extractAngle(this.sensorTransform),
            //    rotate: (event, ui) => {
            //        this.currentAngle = ui.angle.degrees;
            //        this.currentRad = ui.angle.current;
            //    }
            //});
        }

        storeUndo() {
            this.undoStack.push(angular.copy(this.getCurrentConfiguration()));
            this.undoIndex = this.undoStack.length - 1;
        }

        undo() {
            if (this.undoStack.length === 0) {
                return;
            }
            this.loadConfiguration(this.undoStack[this.undoIndex]);
            if (this.undoIndex > 0) {
                this.undoIndex--;
            }
        }

        clearUndoStack() {
            this.undoStack = [];
            this.undoIndex = 0;
        }

        bindRectangles() {
            $('.rect').draggable({
                //containment: '#canvas-container',
                delay: 100,
                start: (event, ui) => {
                    this.draggableStartAdjust(ui);
                },
                drag: (event, ui) => {
                    this.draggableDragAdjust(ui);
                },
                stop: (event, ui) => {
                    let rectangles = this.rectangles;
                    $('.rect').each(function (index, el) {
                        let pos = $(this).position();
                        rectangles[index].top = pos.top;
                        rectangles[index].left = pos.left;
                    });
                }
            });
        }

        bindZones() {
            $('.rectangle').draggable({
                //containment: '#canvas-container',
                cancel: '.rect-handles',
                delay: 100,
                start: (event, ui) => {
                    this.draggableStartAdjust(ui);
                    this.$scope.$apply(() => {
                        this.storeUndo();
                    });
                },
                drag: (event, ui) => {
                    this.draggableDragAdjust(ui);
                },
                stop: (event, ui) => {
                    this.$scope.$apply(() => {
                        this.currentZone.top = ui.position.top;
                        this.currentZone.left = ui.position.left;
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
        }

        updateZoneMeasurements(zone) {
            zone.widthMeasurement = this.getMeasurement(zone.width);
            zone.heightMeasurement = this.getMeasurement(zone.height);
        }

        bindDoorRotation() {
            let me = this;
            let door: any = $('.door');
            door.each(function (index) {
                let angle = me.extractAngle(me.doors[index].transform);
                $(this).rotatable({
                    angle: angle,
                    snap: true,
                    step: 90,
                    start: () => {
                        me.dragging = true;
                    },
                    stop: () => {
                        me.$timeout(() => {
                            me.dragging = false;
                        }, 10);
                    }
                });
            });
            let doorWrapper: any = $('.door-wrapper');
            doorWrapper.draggable({
                //containment: '#canvas-container',
                start: (event, ui) => {
                    this.draggableStartAdjust(ui);
                },
                drag: (event, ui) => {
                    this.draggableDragAdjust(ui);
                },
                stop: (event, ui) => {
                    let doors = this.doors;
                        $('.door-wrapper').each(function (index) {
                            let pos = $(this).position();
                            doors[index].top = pos.top;
                            doors[index].left = pos.left;
                            doors[index].transform = me.getTransform($(this).find('.door'));
                        });
                }
            });
        }

        bindChairRotation() {
            let me = this;
            let chair: any = $('.chair');
            chair.each(function (index) {
                let angle = me.extractAngle(me.chairs[index].transform);
                $(this).rotatable({
                    snap: true,
                    step: 45,
                    angle: angle,
                    start: () => {
                        me.dragging = true;
                    },
                    stop: () => {
                        me.$timeout(() => {
                            me.dragging = false;
                        }, 10);
                    }
                });
            });
            let chairWrapper: any = $('.chair-wrapper');
            chairWrapper.draggable({
                //containment: '#canvas-container',
                start: (event, ui) => {
                    this.draggableStartAdjust(ui);
                },
                drag: (event, ui) => {
                    this.draggableDragAdjust(ui);
                },
                stop: function (event, ui) {
                    let chairs = this.chairs;
                    $('.chair-wrapper').each(function (index, element) {
                        let pos = $(this).position();
                        chairs[index].top = pos.top;
                        chairs[index].left = pos.left;
                        chairs[index].transform = me.getTransform($(this).find('.chair'));
                    });
                }
            });
        }

        onMeasurementChanged() {
            this.boundwidthMeasurement = this.getMeasurement(this.boundary.width);
            this.boundheightMeasurement = this.getMeasurement(this.boundary.height);
            this.zones.forEach((r) => {
                r.widthMeasurement = this.getMeasurement(r.width);
                r.heightMeasurement = this.getMeasurement(r.height);
            });
            this.updateSensorRays();
            this.ruler.measurement = this.getMeasurement(this.ruler.width);
        }

        onConfigSourceChange() {
            this.getConfigurations();
        }
    }

    enum measurementUnit {
        Meters = 1,
        Feet = 2
    }

    let module: any = angular.module('wwxDemo');
    module.component('livePositions', {
        controller: LivePositionsComponent,
        templateUrl: '/app/live-positions/live-positions.component.html'
    });
}