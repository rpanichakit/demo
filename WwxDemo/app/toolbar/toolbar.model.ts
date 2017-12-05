namespace WwxDemo {
    export enum IconType {
        Icon = 0,
        Image = 1,
        Div = 2
    }

    export enum EditMode {
        None = 0,
        Config = 1,
        Boundary = 2,
        Chairs = 3,
        Zone = 4,
        Doors = 5,
        Save = 6,
        Open = 7,
        Ruler = 8,
        Rectangle = 9,
        Clear = 10,
        Export = 11,
        Maximize = 12,
        Logout = 13,
        View = 14,
        Map = 15
    }

    export interface ToolBarItem {
        title: string;
        selectable: boolean;
        mode: EditMode;
        icon: ToolBarIcon;
        selected?: boolean;
    }

    export interface ToolBarIcon {
        type: IconType;
        value: string;
        text?: string;
    }
}