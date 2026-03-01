export class MenuResponseDto {
    id: number;
    parent_menu_id?: number | null;
    name?: string;
    route?: string;
    is_active?: boolean;
    created_at?: Date | null;
    children?: MenuResponseDto[];
}