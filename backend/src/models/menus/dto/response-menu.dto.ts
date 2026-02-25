export class MenuResponseDto{
    menusId: number;
    menusParentId?: number | null;
    name: string;
    route: string;
    children?: MenuResponseDto[];
}