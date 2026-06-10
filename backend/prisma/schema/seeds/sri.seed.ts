import { PrismaClient } from '../../../src/generated/prisma/client';

export async function seedSriCatalogs(prisma: PrismaClient) {
  // 1. Empresa, Establecimiento y Puntos de Emisión
  const empresa = await prisma.empresa.upsert({
    where: { ruc: '2490012345001' },
    update: {},
    create: {
      ruc: '2490012345001',
      razonSocial: 'JUNTA ADMINISTRADORA DE AGUA POTABLE OLON',
      nombreComercial: 'JAAP OLON',
      direccionMatriz: 'Calle Principal Olón',
      obligadoContabilidad: false,
      ambiente: '1'
    }
  });

  const establecimiento = await prisma.establecimientos.upsert({
    where: { 
      emisorId_codigo: { 
        emisorId: empresa.id, 
        codigo: '001' 
      } 
    },
    update: {},
    create: {
      emisorId: empresa.id,
      codigo: '001',
      direccion: 'Calle Principal Olón'
    }
  });

  await prisma.puntosEmision.upsert({
    where: { 
      establecimientoId_codigo: { 
        establecimientoId: establecimiento.id, 
        codigo: '001' 
      } 
    },
    update: {},
    create: {
      establecimientoId: establecimiento.id,
      codigo: '001',
      descripcion: 'VENTANILLA 1',
    }
  });

  // 2. SRI Tipo Comprobante
  const comprobantes = [
    { id: 1, codigo: '01', nombre: 'FACTURA', activo: true },
    { id: 4, codigo: '04', nombre: 'NOTA DE CRÉDITO', activo: true },
    { id: 5, codigo: '05', nombre: 'NOTA DE DÉBITO', activo: true },
    { id: 7, codigo: '07', nombre: 'COMPROBANTE DE RETENCIÓN', activo: true },
  ];

  for (const c of comprobantes) {
    await prisma.sriTipoComprobante.upsert({
      where: { codigo: c.codigo },
      update: c,
      create: c,
    });
  }

}
