export declare class MenuResponseDto {
    id: number;
    parent_menu_id?: number | null;
    icon?: string;
    name?: string;
    route?: string;
    is_active?: boolean;
    created_at?: Date | null;
    children?: MenuResponseDto[];
}
export declare const MenuResponseExample: ({
    id: number;
    parent_menu_id: null;
    icon: string;
    name: string;
    route: string;
    is_active: boolean;
    created_at: Date;
    children: never[];
} | {
    id: number;
    parent_menu_id: null;
    icon: string;
    name: string;
    route: undefined;
    is_active: boolean;
    created_at: Date;
    children: {
        id: number;
        parent_menu_id: number;
        icon: string;
        name: string;
        route: string;
        is_active: boolean;
        created_at: undefined;
        children: never[];
    }[];
})[];
