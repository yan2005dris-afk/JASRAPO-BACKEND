import { MetersInventoryPdfDocumentType } from './meters-inventory.pdf-type';

describe('MetersInventoryPdfDocumentType', () => {
  const adapt = (raw: Record<string, unknown>) =>
    MetersInventoryPdfDocumentType.adaptData(raw)['reporte'] as Record<
      string,
      any
    >;

  it('should map meters into template rows with readable status and contract data', () => {
    const reporte = adapt({
      medidores: [
        {
          serie: 'MED-001',
          marca: 'Itron',
          modelo: 'CX1000',
          estado: 'INSTALADO',
          contratoId: BigInt(45),
          clienteNombre: 'Ana Muñoz',
        },
      ],
    });

    expect(reporte['medidores']).toEqual([
      {
        serie: 'MED-001',
        marca: 'Itron',
        modelo: 'CX1000',
        estado: 'INSTALADO',
        estadoLabel: 'Instalado',
        contrato: '45',
        cliente: 'Ana Muñoz',
      },
    ]);
    expect(reporte['total']).toBe(1);
  });

  it('should mark meters without an assigned contract as unassigned', () => {
    const reporte = adapt({
      medidores: [
        {
          serie: 'MED-002',
          marca: 'Itron',
          modelo: 'CX1000',
          estado: 'BODEGA',
          contratoId: null,
          clienteNombre: null,
        },
      ],
    });

    expect(reporte['medidores'][0]).toMatchObject({
      contrato: '—',
      cliente: 'Sin asignar',
    });
  });

  it('should summarise KPIs by status', () => {
    const reporte = adapt({
      medidores: [
        { estado: 'BODEGA' },
        { estado: 'BODEGA' },
        { estado: 'INSTALADO' },
        { estado: 'DANADO' },
      ],
    });

    expect(reporte['kpis']).toEqual([
      { label: 'En bodega', value: 2 },
      { label: 'Instalados', value: 1 },
      { label: 'Dañados', value: 1 },
    ]);
  });

  it('should describe the applied filters in the header', () => {
    const reporte = adapt({
      medidores: [],
      filtros: { estado: 'BODEGA', search: 'MED' },
    });

    expect(reporte['filtrosAplicados']).toBe(
      'Estado: En Bodega · Búsqueda: MED',
    );
  });

  it('should fall back to a neutral label when no filter is active', () => {
    const reporte = adapt({ medidores: [] });

    expect(reporte['filtrosAplicados']).toBe('Sin filtros aplicados');
    expect(reporte['total']).toBe(0);
  });
});
