import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '..');
const schemaDir = path.join(backendRoot, 'prisma', 'schema');
const baseSchemaPath = path.join(schemaDir, 'base.prisma');
const outputSchemaPath = path.join(backendRoot, 'prisma', 'schema.prisma');

async function collectPrismaFiles(dirPath) {
  const entries = await readdir(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectPrismaFiles(fullPath)));
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    if (path.extname(entry.name) !== '.prisma' || entry.name === 'base.prisma') {
      continue;
    }

    files.push(fullPath);
  }

  return files;
}

function toRelativeSchemaPath(filePath) {
  return path.relative(backendRoot, filePath).replaceAll(path.sep, '/');
}

async function buildSchema() {
  const baseSchema = (await readFile(baseSchemaPath, 'utf8')).trim();
  const prismaFiles = await collectPrismaFiles(schemaDir);

  const sections = [baseSchema];

  for (const filePath of prismaFiles) {
    const content = (await readFile(filePath, 'utf8')).trim();

    if (!content) {
      continue;
    }

    sections.push(`// --- ${toRelativeSchemaPath(filePath)} ---\n${content}`);
  }

  const finalSchema =
    `${sections.join('\n\n')}\n`;

  await writeFile(outputSchemaPath, finalSchema, 'utf8');
  console.log(
    `Generated ${toRelativeSchemaPath(outputSchemaPath)} from ${prismaFiles.length} Prisma fragments.`,
  );
}

await buildSchema();
