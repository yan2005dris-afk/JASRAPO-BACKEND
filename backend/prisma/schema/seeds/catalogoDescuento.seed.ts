import type { PrismaClient } from 'src/generated/prisma/client';

export async function seedCatalogoDescuento(prisma: PrismaClient) {
  const descuentos = [
    {
      nombre: 'Beneficio Tercera Edad',
      descripcion: 'Descuento del 50% por ley para adultos mayores',
      tipoDescuento: 'TERCERA_EDAD' as any,
      valor: 50,
      esPorcentaje: true,
      aplicaAutomatico: true,
      activo: true,
    },
    {
      nombre: 'Beneficio Discapacidad',
      descripcion: 'Descuento del 50% por ley según carnet',
      tipoDescuento: 'DISCAPACIDAD' as any,
      valor: 50,
      esPorcentaje: true,
      aplicaAutomatico: true,
      activo: true,
    },
    {
      nombre: 'Exención Tasa Seguridad',
      descripcion: 'Exoneración de tasa de seguridad ciudadana',
      tipoDescuento: 'EXENCION_TASA' as any,
      valor: 100,
      esPorcentaje: true,
      aplicaAutomatico: false,
      activo: true,
    },
    {
      nombre: 'Rebaja Interés Mora',
      descripcion: 'Descuento autorizado sobre intereses acumulados',
      tipoDescuento: 'INTERES_MORA' as any,
      valor: 0, // Se define al momento de aplicar
      esPorcentaje: false,
      aplicaAutomatico: false,
      activo: true,
    },
  ];

  for (const d of descuentos) {
    await prisma.catalogoDescuento.create({
      data: d,
    });
  }
}
