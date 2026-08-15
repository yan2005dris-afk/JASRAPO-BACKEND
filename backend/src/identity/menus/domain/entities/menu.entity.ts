export class MenuEntity {
  menuId: number;
  menuPadreId: number | null;
  nombre: string;
  ruta: string;
  icono: string | null;
  activo: boolean;
  createdAt?: Date | null;

  constructor(partial?: Partial<MenuEntity>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
