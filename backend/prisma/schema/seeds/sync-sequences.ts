import { PrismaClient } from "src/generated/prisma/client";

export async function syncSequences(prisma: PrismaClient) {
  console.log('🔄 Sincronizando secuencias...');
  
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  for (const { tablename } of tablenames) {
    if (tablename === '_prisma_migrations') continue;

    // Obtener el nombre de la secuencia para la columna de ID (asumiendo que sigue el patrón estándar de Postgres o el mapeo de Prisma)
    // Intentamos encontrar la columna PK primero
    const pkInfo = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT a.attname as column_name
      FROM pg_index i
      JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
      WHERE i.indrelid = ${'public.' + tablename}::regclass
      AND i.indisprimary;
    `;

    if (pkInfo.length > 0) {
      const column = pkInfo[0].column_name;
      try {
        await prisma.$executeRawUnsafe(`
          SELECT setval(pg_get_serial_sequence('"${tablename}"', '${column}'), coalesce(max("${column}"), 1)) FROM "${tablename}";
        `);
      } catch (e) {
        // Algunas tablas pueden no tener secuencias (IDs manuales o no autoincrementales)
        // console.warn(\`⚠️ No se pudo sincronizar la secuencia para \${tablename}.\${column}\`);
      }
    }
  }
  console.log('✅ Secuencias sincronizadas.');
}
