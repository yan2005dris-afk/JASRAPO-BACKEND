/**
 * Generador de enums desde schemas Prisma
 *
 * Lee todos los archivos .prisma de prisma/schema/ y genera
 * src/shared/enums/index.ts con constantes + tipos para cada enum.
 *
 * Esto reemplaza los enums runtime que Prisma 7.x ya no exporta
 * con el provider prisma-client.
 *
 * Uso: npx tsx scripts/generate-enums.ts
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { glob } from 'glob';

const SCHEMA_DIR = path.resolve(__dirname, '..', 'prisma', 'schema');
const OUTPUT_DIR = path.resolve(__dirname, '..', 'src', 'shared', 'enums');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'index.ts');

interface EnumDef {
  name: string;
  values: string[];
  sourceFile: string;
}

function parseEnums(content: string, filePath: string): EnumDef[] {
  const enums: EnumDef[] = [];
  const enumRegex = /^enum\s+(\w+)\s*{([^}]*)}/gm;
  let match: RegExpExecArray | null;

  while ((match = enumRegex.exec(content)) !== null) {
    const name = match[1]!;
    const body = match[2]!;
    const values = body
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith('//') && !line.startsWith('@@'))
      .map((line) => line.split(/\s+/)[0]!);

    if (values.length > 0) {
      enums.push({ name, values, sourceFile: path.relative(SCHEMA_DIR, filePath) });
    }
  }

  return enums;
}

function generateFile(enums: EnumDef[]): string {
  const lines: string[] = [
    '// Auto-generado por scripts/generate-enums.ts',
    '// NO EDITAR MANUALMENTE - Ejecutar: npx tsx scripts/generate-enums.ts',
    '// Fuente: schemas Prisma en prisma/schema/',
    '',
    '/**',
    ' * Enums compatibles con Prisma 7.x',
    ' * Proporciona objetos runtime + tipos que Prisma ya no genera automáticamente',
    ' */',
    '',
  ];

  for (const e of enums) {
    const typeName = e.name;

    // Const object
    lines.push(`export const ${typeName} = {`);
    for (const value of e.values) {
      lines.push(`  ${value}: '${value}',`);
    }
    lines.push('} as const;');
    lines.push('');

    // Type
    lines.push(
      `export type ${typeName} = (typeof ${typeName})[keyof typeof ${typeName}];`,
    );
    lines.push('');
    lines.push(`// Fuente: ${e.sourceFile}`);
    lines.push('');
  }

  return lines.join('\n');
}

async function main() {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Scan all Prisma schema files
  const schemaFiles = await glob('**/*.prisma', { cwd: SCHEMA_DIR });

  const allEnums: EnumDef[] = [];
  const seen = new Set<string>();

  for (const relativePath of schemaFiles.sort()) {
    const fullPath = path.join(SCHEMA_DIR, relativePath);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const enums = parseEnums(content, fullPath);

    for (const e of enums) {
      if (seen.has(e.name)) {
        console.error(`❌ Error: Enum duplicado "${e.name}" detectado en ${relativePath} (ya definido previamente).`);
        process.exit(1);
      }
      seen.add(e.name);
      allEnums.push(e);
    }
  }

  // Sort by name for deterministic output
  allEnums.sort((a, b) => a.name.localeCompare(b.name));

  const output = generateFile(allEnums);
  fs.writeFileSync(OUTPUT_FILE, output, 'utf-8');

  console.log(`✅ Generados ${allEnums.length} enums en ${OUTPUT_FILE}`);
  for (const e of allEnums) {
    console.log(`   - ${e.name} (${e.values.length} valores)`);
  }
}

main().catch((err) => {
  console.error('❌ Error generando enums:', err);
  process.exit(1);
});
