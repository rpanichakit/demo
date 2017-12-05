namespace WwxDemo {
    class appComponent {
        static $inject = ['$location'];
        constructor($location: ng.ILocationService) {

        }

        $onInit() {

        }
    }

    let module: any = angular.module('wwxDemo');
    module.component('viewerComponent', {
        controller: appComponent,
        template: `<live-positions>`
    });
}