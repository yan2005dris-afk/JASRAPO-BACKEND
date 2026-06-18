import type { PrismaClient } from 'src/generated/prisma/client';

export async function syncSequences(prisma: PrismaClient) {
  console.log('🔄 Sincronizando secuencias...');

  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  for (const { tablename } of tablenames) {
    if (tablename === '_prisma_migrations') continue;

    const pkInfo = await prisma.$queryRaw<
      Array<{ column_name: string; column_type: string }>
    >`
      SELECT a.attname as column_name,
             pg_catalog.format_type(a.atttypid, a.atttypmod) as column_type
      FROM pg_index i
      JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
      WHERE i.indrelid = ${'public.' + tablename}::regclass
        AND i.indisprimary;
    `;

    if (pkInfo.length === 0) continue;

    const { column_name: column, column_type: type } = pkInfo[0];

    // MAX() solo funciona en enteros; UUID y text no tienen secuencia serial
    if (!/^(integer|bigint|smallint)$/.test(type)) continue;

    try {
      await prisma.$executeRawUnsafe(`
        SELECT setval(
          pg_get_serial_sequence('"${tablename}"', '${column}'),
          coalesce(max("${column}"), 1)
        ) FROM "${tablename}";
      `);
    } catch {
      // La tabla existe pero no tiene secuencia (PK manual)
    }
  }

  console.log('✅ Secuencias sincronizadas.');
}
