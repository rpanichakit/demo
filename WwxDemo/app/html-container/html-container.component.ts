namespace WwxDemo {
    class HtmlContainerComponent {

    }

    angular.module('wwxDemo')
        .component('htmlContainer', {
            controller: HtmlContainerComponent as any,
            template: `
            <div id="canvas-container" 
                ng-mouseup="$ctrl.canvasMouseUp($event)" 
                ng-click="$ctrl.canvasClicked($event)" 
                ng-mousemove="$ctrl.canvasMouseMove($event)">
            </div>
            `
        });
}