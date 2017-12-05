namespace WwxDemo {
    class viewerComponent {
        static $inject = ['$location'];
        constructor($location: ng.ILocationService) {

        }

        $onInit() {

        }
    }

    let module: any = angular.module('wwxDemo');
    module.component('viewerComponent', {
        controller: viewerComponent,
        template:`<img id="map" 
                            ng-show="$ctrl.mapPath" 
                            ng-src="{{$ctrl.mapPath}}" 
                            ng-dblclick="$ctrl.clearMap()"
                            ng-style="{top:$ctrl.mapPosition.top,left:$ctrl.mapPosition.left}" />`
    });
}