export class MenuResponseDto {
  id: number;
  parent_menu_id?: number | null;
  icon?: string | null;
  name?: string;
  route?: string;
  is_active?: boolean;
  children?: MenuResponseDto[];
}
