import { PrismaClient } from '../../../src/generated/prisma/client';

export async function seedSriCatalogs(prisma: PrismaClient) {
  // SRI Tipo Comprobante
  const comprobantes = [
    { id: 1, codigo: '01', nombre: 'FACTURA', activo: true },
    { id: 4, codigo: '04', nombre: 'NOTA DE CRÉDITO', activo: true },
    { id: 5, codigo: '05', nombre: 'NOTA DE DÉBITO', activo: true },
    { id: 6, codigo: '06', nombre: 'GUÍA DE REMISIÓN', activo: true },
    { id: 7, codigo: '07', nombre: 'COMPROBANTE DE RETENCIÓN', activo: true },
  ];

  for (const c of comprobantes) {
    await prisma.sriTipoComprobante.upsert({
      where: { codigo: c.codigo },
      update: c,
      create: c,
    });
  }

  // SRI Impuesto
  // Nota: codigo '2' es IVA. codigo_porcentaje define la tarifa.
  const impuestos = [
    { id: 1, codigo: '2', codigoPorcentaje: '0', nombre: 'IVA 0%', tarifa: 0 },
    { id: 2, codigo: '2', codigoPorcentaje: '2', nombre: 'IVA 12%', tarifa: 12 },
    { id: 4, codigo: '2', codigoPorcentaje: '4', nombre: 'IVA 15%', tarifa: 15 },
    { id: 5, codigo: '2', codigoPorcentaje: '5', nombre: 'IVA 5%', tarifa: 5 },
  ];

  for (const i of impuestos) {
    await prisma.sriImpuesto.upsert({
      where: { id: i.id },
      update: i,
      create: i,
    });
  }

  // SRI Forma Pago
  const formasPago = [
    { id: 1, codigo: '01', nombre: 'EFECTIVO (SIN UTILIZACION DEL SISTEMA FINANCIERO)', activo: true },
    { id: 16, codigo: '16', nombre: 'TARJETA DE DEBITO', activo: true },
    { id: 19, codigo: '19', nombre: 'TARJETA DE CREDITO', activo: true },
    { id: 20, codigo: '20', nombre: 'TRANSFERENCIA/OTROS (CON UTILIZACION DEL SISTEMA FINANCIERO)', activo: true },
  ];

  for (const f of formasPago) {
    await prisma.sriFormaPago.upsert({
      where: { codigo: f.codigo },
      update: f,
      create: f,
    });
  }
}
