import type { PrismaClient } from 'src/generated/prisma/client';

export async function seedEstadosConvenio(prisma: PrismaClient) {
  const now = new Date();

  const estados = [
    {
      codigo: 'PREPARADO',
      nombre: 'Preparado',
      descripcion: 'Convenio creado, pendiente de activación o abono inicial',
      activo: true,
      orden: 1,
      updatedAt: now,
    },
    {
      codigo: 'PENDIENTE_ABONO',
      nombre: 'Pendiente de Abono',
      descripcion:
        'Convenio requiere el pago del abono inicial antes de activarse',
      activo: true,
      orden: 2,
      updatedAt: now,
    },
    {
      codigo: 'ACTIVO',
      nombre: 'Activo',
      descripcion: 'Convenio en curso con cuotas vigentes',
      activo: true,
      orden: 3,
      updatedAt: now,
    },
    {
      codigo: 'CUMPLIDO',
      nombre: 'Cumplido',
      descripcion: 'Todas las cuotas han sido pagadas en su totalidad',
      activo: true,
      orden: 4,
      updatedAt: now,
    },
    {
      codigo: 'ANULADO',
      nombre: 'Anulado',
      descripcion: 'Convenio anulado antes de su cumplimiento',
      activo: true,
      orden: 5,
      updatedAt: now,
    },
    {
      codigo: 'VENCIDO',
      nombre: 'Vencido',
      descripcion: 'Convenio con cuotas vencidas sin pago registrado',
      activo: true,
      orden: 6,
      updatedAt: now,
    },
  ];

  for (const estado of estados) {
    await prisma.estadoConvenio.upsert({
      where: { codigo: estado.codigo },
      update: {
        nombre: estado.nombre,
        descripcion: estado.descripcion,
        activo: estado.activo,
        orden: estado.orden,
        updatedAt: estado.updatedAt,
      },
      create: estado,
    });
  }

  console.log(`✅ ${estados.length} estados de convenio creados/actualizados.`);
}

export async function seedEstadosCuotaConvenio(prisma: PrismaClient) {
  const now = new Date();

  const estados = [
    {
      codigo: 'PENDIENTE',
      nombre: 'Pendiente',
      descripcion: 'Cuota pendiente de pago',
      activo: true,
      orden: 1,
      updatedAt: now,
    },
    {
      codigo: 'PAGADA',
      nombre: 'Pagada',
      descripcion: 'Cuota pagada en su totalidad',
      activo: true,
      orden: 2,
      updatedAt: now,
    },
    {
      codigo: 'VENCIDA',
      nombre: 'Vencida',
      descripcion: 'Cuota vencida sin pago registrado',
      activo: true,
      orden: 3,
      updatedAt: now,
    },
    {
      codigo: 'ANULADA',
      nombre: 'Anulada',
      descripcion: 'Cuota anulada junto al convenio',
      activo: true,
      orden: 4,
      updatedAt: now,
    },
    {
      codigo: 'ANTICIPADA',
      nombre: 'Anticipada',
      descripcion: 'Cuota pagada de forma anticipada antes de su vencimiento',
      activo: true,
      orden: 5,
      updatedAt: now,
    },
  ];

  for (const estado of estados) {
    await prisma.estadoCuotaConvenio.upsert({
      where: { codigo: estado.codigo },
      update: {
        nombre: estado.nombre,
        descripcion: estado.descripcion,
        activo: estado.activo,
        orden: estado.orden,
        updatedAt: estado.updatedAt,
      },
      create: estado,
    });
  }

  console.log(
    `✅ ${estados.length} estados de cuota de convenio creados/actualizados.`,
  );
}
