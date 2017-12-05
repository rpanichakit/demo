namespace WwxDemo {
    class MainComponent {
        showToolbar = true;
        mode: EditMode = EditMode.None;

        onToolSelect(mode) {
            if (mode === this.mode) {
                this.mode = EditMode.None;
            } else {
                switch (mode) {
                    case EditMode.Clear:
                        this.clearScreen();
                        break;
                    case EditMode.Export:
                        this.export();
                        break;
                    case EditMode.Maximize:
                        this.hideToolbar();
                        break;
                    case EditMode.Logout:
                        this.logout();
                        break;
                    default:
                        this.mode = mode;
                }
            }
        }

        hideToolbar() {

        }

        clearScreen() {

        }

        export() {

        }

        logout() {

        }

        onScaleChanged() {

        }

        onUnitIdChanged() {

        }
    }

    angular.module('wwxDemo').component('main', {
        controller: MainComponent as any,
        template: `
            <html-container></html-container>
            <canvas-container></canvas-container>
            <svg-container></svg-container>
            <dots-labels></dots-labels>
            <menu-button></menu-button>
            <toolbar show="$ctrl.showToolbar" current-mode="$ctrl.mode" on-tool-select="$ctrl.onToolSelect(mode)"></toolbar>
            <!--<properties-panel></properties-panel>-->
            <powered-by></powered-by>
        `
    });
}