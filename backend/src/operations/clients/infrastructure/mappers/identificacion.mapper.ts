export interface IdentificacionDomain {
  id: number;
  codigo: string;
  descripcion: string;
  activo: boolean;
}

export class IdentificacionMapper {
  static toDomain(raw: any): IdentificacionDomain | null {
    if (!raw) return null;
    return {
      id: raw.id,
      codigo: raw.codigo,
      descripcion: raw.descripcion,
      activo: raw.activo,
    };
  }
}
