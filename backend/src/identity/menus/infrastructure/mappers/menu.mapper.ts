import { MenuEntity } from '../../domain/entities/menu.entity';

export class MenuMapper {
  static toEntity(raw: any): MenuEntity | null {
    if (!raw) return null;
    return new MenuEntity({
      menuId: raw.menuId,
      menuPadreId: raw.menuPadreId,
      nombre: raw.nombre,
      ruta: raw.ruta,
      icono: raw.icono,
      activo: raw.activo,
      createdAt: raw.createdAt,
    });
  }
}
