import { execSync } from 'node:child_process';

/**
 * Script de auditoría de seguridad para CI.
 *
 * NOTA / TODO(sec): Limpiar esta excepción una vez que upstream publique node-forge >= 1.5.0
 * con el parche correspondiente (https://github.com/advisories/GHSA-86w9-cpqp-85rv).
 * En este proyecto node-forge solo se utiliza para empaquetado/firma digital de comprobantes SRI
 * y lectura de certificados P12 propios, no para verificación de firmas RSA de terceros.
 */
const TEMPORARY_ALLOWED_ADVISORIES = new Set([
  'GHSA-86w9-cpqp-85rv', // node-forge <= 1.4.0 (esperando release 1.5+ de node-forge)
]);

try {
  execSync('pnpm audit --prod --audit-level=high --json', {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  console.log('✅ pnpm audit pasó sin vulnerabilidades high o critical.');
} catch (error) {
  const stdout = error.stdout?.toString() || '';
  if (!stdout) {
    console.error('❌ Error ejecutando pnpm audit:', error.message);
    process.exit(1);
  }

  let auditReport;
  try {
    auditReport = JSON.parse(stdout);
  } catch (parseErr) {
    console.error('❌ No se pudo parsear el reporte JSON de pnpm audit:', stdout);
    process.exit(1);
  }

  const advisories = Object.values(auditReport.advisories || {});
  const blockingAdvisories = advisories.filter(
    (adv) => !TEMPORARY_ALLOWED_ADVISORIES.has(adv.github_advisory_id),
  );

  if (blockingAdvisories.length > 0) {
    console.error(
      `❌ Se encontraron ${blockingAdvisories.length} vulnerabilidad(es) bloqueantes no autorizadas:`,
    );
    for (const adv of blockingAdvisories) {
      console.error(
        ` - [${adv.severity.toUpperCase()}] ${adv.module_name}: ${adv.title} (${adv.github_advisory_id})`,
      );
    }
    process.exit(1);
  }

  console.log(
    `⚠️  Aviso: Se omitieron temporalmente las siguientes vulnerabilidades documentadas (${Array.from(TEMPORARY_ALLOWED_ADVISORIES).join(', ')}).`,
  );
  console.log('✅ No se encontraron otras vulnerabilidades high o critical.');
}
