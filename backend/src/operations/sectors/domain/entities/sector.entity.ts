export interface ComunidadRef {
  comunidadId: number;
  codigo: string;
  nombre: string;
}

export class SectorEntity {
  public sectorId: number;
  public nombre: string;
  public codigo: string;
  public comunidadId: number | null;
  public comunidades?: ComunidadRef | null;
  public deletedAt: Date | null;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(partial?: Partial<SectorEntity>) {
    if (partial) {
      Object.assign(this, partial);
      this.validateInvariants();
    }
  }

  validateInvariants(): void {
    if (this.nombre !== undefined && this.nombre !== null && this.nombre.trim() === '') {
      throw new Error('El nombre del sector no puede estar vacío');
    }
    if (this.codigo !== undefined && this.codigo !== null && this.codigo.trim() === '') {
      throw new Error('El código del sector no puede estar vacío');
    }
  }
}
