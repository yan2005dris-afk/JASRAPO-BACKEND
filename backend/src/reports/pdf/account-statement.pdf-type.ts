import type { PdfDocumentType } from 'src/infrastructure/pdf/document-type.interface';

export const AccountStatementPdfDocumentType: PdfDocumentType = {
  type: 'account-statement',
  name: 'Estado de Cuenta',
  template: 'account-statement',

  adaptData(raw: Record<string, unknown>): Record<string, unknown> {
    const contrato = raw['contrato'] as Record<string, unknown> | undefined;
    const cliente = contrato?.['cliente'] as
      | Record<string, unknown>
      | undefined;
    const sector = contrato?.['sector'] as Record<string, unknown> | undefined;
    const categoriaTarifa = contrato?.['categoriaTarifa'] as
      | Record<string, unknown>
      | undefined;
    const historial = contrato?.['historialMedidores'] as
      | Record<string, unknown>[]
      | undefined;
    const medidorSerie = (
      historial?.[0]?.['medidor'] as Record<string, unknown> | undefined
    )?.['serie'] as string | undefined;

    const consumoBase = Number(categoriaTarifa?.['consumoMinimoMensual'] ?? 0);
    const valorBase = Number(categoriaTarifa?.['valorBase'] ?? 0);
    const valorExcedente = Number(categoriaTarifa?.['valorExcedenteM3'] ?? 0);

    const periods = (raw['periods'] as Record<string, unknown>[]) ?? [];
    const years: Record<string, unknown>[] = [];
    let totalDeuda = 0;

    for (const period of periods) {
      const pf = period['prefactura'] as Record<string, unknown> | undefined;
      const periodo = pf?.['periodoRel'] as Record<string, unknown> | undefined;
      const lecturas = (period['lecturas'] as Record<string, unknown>[]) ?? [];

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
            ? fecha.toLocaleDateString('es-EC', {
                month: 'long',
                year: 'numeric',
              })
            : '—',
          lectActual: Number(lectura['lecturaActual'] ?? 0).toFixed(2),
          lectAnterior: Number(lectura['lecturaAnterior'] ?? 0).toFixed(2),
          consu: consu.toFixed(2),
          excede: excede.toFixed(2),
          cargoFijo: valorBase.toFixed(2),
          excedenteValor: excedentePrecio.toFixed(2),
          total: (valorBase + excedentePrecio).toFixed(2),
          intMora: '0.00',
          tasaSeg: '0.00',
          convenio: '0.00',
          totalMes: totalMes.toFixed(2),
          pagos: pagoAjustado.toFixed(2),
          saldo: saldoAcumulado.toFixed(2),
          saldoNum: saldoAcumulado,
        };
      });

      // El subtotal anual es la suma de todos los cargos mensuales (cargo fijo + excedentes)
      const subtotalAnual = meses.reduce(
        (sum, m) => sum + Number(m['totalMes'] ?? 0),
        0,
      );

      years.push({
        nombre: periodo?.['nombre'] ?? '—',
        meses,
        subtotalAnual: subtotalAnual.toFixed(2),
        pagos: abonoAnual.toFixed(2),
        saldo: saldoAcumulado.toFixed(2),
        saldoNum: saldoAcumulado,
      });

      if (saldoAcumulado > 0) totalDeuda += saldoAcumulado;
    }

    const clienteNombre =
      [cliente?.['nombres'], cliente?.['apellidos']]
        .filter(Boolean)
        .join(' ') ||
      (cliente?.['razonSocial'] as string) ||
      '—';

    const fechaEmision = new Date().toLocaleDateString('es-EC', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    return {
      reporte: {
        titulo: 'Estado de Cuenta',
        fechaEmision,
        cuenta: raw['contratoId'] ?? '—',
        sector: (sector?.['nombre'] as string) ?? '—',
        medidor: medidorSerie ?? '—',
        clienteNombre,
        clienteDireccion: (cliente?.['direccionDomicilio'] as string) ?? '—',
        clienteIdentificacion: (cliente?.['identificacion'] as string) ?? '—',
        tarifaTipo: (categoriaTarifa?.['nombre'] as string) ?? '—',
        cargoFijo: valorBase.toFixed(2),
        factor: valorExcedente.toFixed(4),
        years,
        deudaTotal: totalDeuda.toFixed(2),
      },
    };
  },
};
