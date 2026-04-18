import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function validateDiscounts() {
  console.log('🔍 Iniciando validación de descuentos (Arquitectura Híbrida)...');

  // 1. Obtener prefacturas con sus detalles y auditoría de descuentos
  const prefacturas = await (prisma as any).prefacturas.findMany({
    include: {
      prefacturaDetalle: {
        include: {
          descuentosDetalle: {
            include: {
              catalogo: true,
              usuarioAutoriza: true
            }
          }
        }
      }
    }
  });

  if (prefacturas.length === 0) {
    console.log('ℹ️ No hay prefacturas para validar.');
    return;
  }

  for (const pf of prefacturas) {
    let pfDescuentoTotalCalculado = 0;

    for (const detalle of pf.prefacturaDetalle) {
      const montoDescuentoLinea = Number(detalle.descuento || 0);
      
      if (montoDescuentoLinea > 0) {
        console.log(`\n📄 Validando Línea: "${detalle.descripcion}" en Prefactura ${pf.prefacturaId}`);
        
        // Regla 1: El monto en la línea debe coincidir con la auditoría
        const sumaAuditoria = detalle.descuentosDetalle.reduce((sum, d) => sum + Number(d.montoDescontado), 0);
        
        if (Math.abs(sumaAuditoria - montoDescuentoLinea) > 0.01) {
          console.error(`❌ ERROR: Auditoría no coincide con la línea. Detalle (${montoDescuentoLinea}) != Auditoría (${sumaAuditoria})`);
        } else {
          console.log(`✅ Auditoría coincide con el monto de la línea ($${montoDescuentoLinea}).`);
        }

        // Regla 2: Trazabilidad
        for (const aud of detalle.descuentosDetalle) {
          console.log(`   - Descuento: "${aud.catalogo?.nombre || aud.motivo}" | Autorizado por: ${aud.usuarioAutoriza?.email || 'N/D'}`);
        }

        pfDescuentoTotalCalculado += montoDescuentoLinea;
      }
    }

    // Regla 3: El total del documento debe coincidir con la suma de las líneas
    const pfDescuentoTotalDB = Number(pf.descuentoTotal || 0);
    if (Math.abs(pfDescuentoTotalCalculado - pfDescuentoTotalDB) > 0.01) {
      console.error(`❌ ERROR TOTAL: Prefactura ${pf.prefacturaId}. Suma líneas (${pfDescuentoTotalCalculado}) != Cabecera (${pfDescuentoTotalDB})`);
    }
  }

  console.log('\n✅ Validación de arquitectura híbrida finalizada.');
}

validateDiscounts()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
