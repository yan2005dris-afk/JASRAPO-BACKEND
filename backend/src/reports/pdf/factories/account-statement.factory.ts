import type { PdfDocumentType } from 'src/infrastructure/pdf/document-type.interface';
import { getPdfLogoUrl } from 'src/infrastructure/pdf/utils/pdf-logo-loader.util';

export type AccountStatementStyle = 'legacy' | 'modern';

export function createAccountStatementPdfDocumentType(
  style: AccountStatementStyle,
): PdfDocumentType {
  const isLegacy = style === 'legacy';

  return {
    type: isLegacy ? 'account-statement-legacy' : 'account-statement-modern',
    name: isLegacy ? 'Estado de Cuenta (Legacy)' : 'Estado de Cuenta (Moderno)',
    template: isLegacy
      ? 'account-statement-legacy'
      : 'account-statement-modern',

    adaptData(raw: Record<string, unknown>): Record<string, unknown> {
      const contrato = raw['contrato'] as Record<string, unknown> | undefined;
      const cliente = contrato?.['cliente'] as
        | Record<string, unknown>
        | undefined;
      const sector = contrato?.['sector'] as
        | Record<string, unknown>
        | undefined;
      const categoriaTarifa = contrato?.['categoriaTarifa'] as
        | Record<string, unknown>
        | undefined;
      const historial = contrato?.['historialMedidores'] as
        | Record<string, unknown>[]
        | undefined;
      const medidorSerie = (
        historial?.[0]?.['medidor'] as Record<string, unknown> | undefined
      )?.['serie'] as string | undefined;

      const consumoBase = Number(
        categoriaTarifa?.['consumoMinimoMensual'] ?? 0,
      );
      const valorBase = Number(categoriaTarifa?.['valorBase'] ?? 0);
      const valorExcedente = Number(categoriaTarifa?.['valorExcedenteM3'] ?? 0);

      const periods = (raw['periods'] as Record<string, unknown>[]) ?? [];
      const years: Record<string, unknown>[] = [];
      let totalDeuda = 0;

      for (const period of periods) {
        const pf = period['prefactura'] as Record<string, unknown> | undefined;
        const periodo = pf?.['periodoRel'] as
          | Record<string, unknown>
          | undefined;
        const lecturas =
          (period['lecturas'] as Record<string, unknown>[]) ?? [];

        const abonoAnual = Number(pf?.['abono'] ?? 0);

        let saldoAcumulado = 0;
        const meses = lecturas.map((lectura, idx) => {
          const fecha = lectura['fecha']
            ? new Date(lectura['fecha'] as string)
            : null;
          const consumoM3 = Number(lectura['consumoCalculado'] ?? 0);
          const consu = Math.min(consumoM3, consumoBase);
          const excede = Math.max(consumoM3 - consumoBase, 0);
          const excedentePrecio = excede * valorExcedente;
          const totalMes = valorBase + excedentePrecio;

          // Distribuir abono anual equitativamente entre los 12 meses
          const pagoMes = abonoAnual > 0 ? +(abonoAnual / 12).toFixed(2) : 0;
          // Ajustar el último mes para que sume exactamente el abono anual
          const pagoAjustado = idx === 11 ? abonoAnual - pagoMes * 11 : pagoMes;

          saldoAcumulado = saldoAcumulado + totalMes - pagoAjustado;

          return {
            mes: fecha
              ? fecha.toLocaleString('es-EC', { month: 'short' }).toUpperCase()
              : '—',
            lectActual: Number(lectura['lecturaActual'] ?? 0).toFixed(0),
            lectAnterior: Number(lectura['lecturaAnterior'] ?? 0).toFixed(0),
            consu: consu.toFixed(0),
            excede: excede.toFixed(0),
            cargoFijo: valorBase.toFixed(2),
            excedenteValor: excedentePrecio.toFixed(2),
            total: totalMes.toFixed(2),
            intMora: '0.00',
            tasaSeg: '0.00',
            convenio: '0.00',
            totalMes: totalMes.toFixed(2),
            pagos: pagoAjustado.toFixed(2),
            saldo: saldoAcumulado.toFixed(2),
          };
        });

        const subtotalAnual = meses.reduce(
          (acc, m) => acc + Number(m.totalMes),
          0,
        );
        const pagosTotal = meses.reduce((acc, m) => acc + Number(m.pagos), 0);
        const saldoFinal =
          meses.length > 0 ? Number(meses[meses.length - 1]?.saldo ?? 0) : 0;
        totalDeuda += saldoFinal;

        years.push({
          nombre: periodo?.['nombre'] ?? '—',
          meses,
          subtotalAnual: subtotalAnual.toFixed(2),
          pagos: pagosTotal.toFixed(2),
          saldo: saldoFinal.toFixed(2),
        });
      }

      const clienteNombre = cliente
        ? `${cliente['nombres'] ?? ''} ${cliente['apellidos'] ?? ''}`.trim()
        : '—';

      return {
        logoUrl: isLegacy ? undefined : getPdfLogoUrl(),
        reporte: {
          titulo: 'Estado de Cuenta',
          fechaEmision: new Date().toLocaleDateString('es-EC'),
          sector: sector?.['nombre'] ?? '—',
          cuenta: contrato?.['numeroGuia'] ?? '—',
          medidor: medidorSerie ?? '—',
          tarifaTipo: categoriaTarifa?.['nombre'] ?? '—',
          clienteNombre,
          clienteIdentificacion: cliente?.['identificacion'] ?? '—',
          clienteDireccion: contrato?.['direccionSuministro'] ?? '—',
          cargoFijo: valorBase.toFixed(2),
          factor: valorExcedente.toFixed(2),
          years,
          deudaTotal: totalDeuda.toFixed(2),
        },
      };
    },
  };
}
