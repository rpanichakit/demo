namespace WwxDemo {
    class ToolbarItemComponent {
        IconType = IconType

        $onInit() {

        }
    }

    angular.module('wwxDemo')
        .component('toolbarItem', {
            controller: ToolbarItemComponent as any,
            bindings: {
                title: '<',
                selectable: '<',
                mode: '<',
                icon: '<',
                selected: '<',
                onItemClicked: '&'
            },
            template: `
                <div title="{{$ctrl.title}}" class="label-wrapper" ng-class="{selected:$ctrl.selected}" ng-click="$ctrl.onItemClicked({mode: $ctrl.mode})">
                    <div class="tab-label">
                        <i ng-if="$ctrl.icon.type === $ctrl.IconType.Icon" class="fa fa-{{$ctrl.icon.value}}" aria-hidden="true"></i>
                        <img ng-if="$ctrl.icon.type === $ctrl.IconType.Image" ng-src="{{$ctrl.icon.value}}" />
                        <div ng-if="$ctrl.icon.type === $ctrl.IconType.Div" id="{{$ctrl.icon.value}}">{{$ctrl.icon.text}}</div>
                    </div>
                </div>
            `
        });
}