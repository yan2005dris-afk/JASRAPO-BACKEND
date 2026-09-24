import type { ColumnDefinition } from '../../infrastructure/export/interfaces/export.interface';
import type { ReportKey } from './report-style.service';

export interface ReportExportData {
  columns: ColumnDefinition<any>[];
  rows: any[];
  sheetName: string;
}

export class ReportExportAdapter {
  static extractExportData(
    reportType: ReportKey,
    document: any,
  ): ReportExportData {
    const reporte = document?.reporte || document;

    switch (reportType) {
      case 'clients-list': {
        const rows = reporte?.clientes || [];
        const columns: ColumnDefinition[] = [
          { header: 'Identificación', key: 'identificacion', width: 16 },
          { header: 'Nombre Completo', key: 'nombre', width: 32 },
          { header: 'Correo Electrónico', key: 'email', width: 28 },
          { header: 'Teléfono', key: 'telefono', width: 16 },
          { header: 'Dirección', key: 'direccion', width: 36 },
          { header: 'Estado', key: 'activo', width: 12 },
          { header: 'Tipo Identificación', key: 'tipoId', width: 20 },
        ];
        return { columns, rows, sheetName: 'Clientes' };
      }

      case 'payments-report': {
        const rows: any[] = [];
        const groups = reporte?.grupos || [];
        for (const group of groups) {
          for (const p of group.pagos || []) {
            rows.push({
              comprobante: group.comprobante || '—',
              periodo: group.periodo || '—',
              contratoId: group.contratoId || '—',
              medidor: group.medidor || '—',
              fecha: p.fecha || '—',
              cliente: p.cliente || '—',
              metodo: p.metodo || '—',
              referencia: p.referencia || '—',
              valor: p.valor || '0.00',
            });
          }
        }
        const columns: ColumnDefinition[] = [
          { header: 'Factura / Comprobante', key: 'comprobante', width: 22 },
          { header: 'Período', key: 'periodo', width: 18 },
          { header: 'Contrato', key: 'contratoId', width: 14 },
          { header: 'Medidor', key: 'medidor', width: 16 },
          { header: 'Fecha de Pago', key: 'fecha', width: 14 },
          { header: 'Cliente', key: 'cliente', width: 30 },
          { header: 'Método', key: 'metodo', width: 16 },
          { header: 'Referencia', key: 'referencia', width: 20 },
          { header: 'Monto Abonado ($)', key: 'valor', width: 18 },
        ];
        return { columns, rows, sheetName: 'Abonos' };
      }

      case 'connection-history': {
        const rows = (reporte?.invoices || reporte?.filas || []).map(
          (inv: any) => ({
            emision: inv.emision || inv.periodName || '—',
            lectAnterior: inv.lectAnterior ?? inv.previousReading ?? '0',
            lectActual: inv.lectActual ?? inv.currentReading ?? '0',
            consumo: inv.consumo ?? inv.consumption ?? '0',
            valEmision: inv.valEmision ?? inv.billedAmount ?? '0.00',
            abonos: inv.abonos ?? inv.paidAmount ?? '0.00',
            saldo: inv.saldo ?? inv.outstandingBalance ?? '0.00',
          }),
        );
        const columns: ColumnDefinition[] = [
          { header: 'Emisión / Período', key: 'emision', width: 20 },
          { header: 'Lectura Anterior', key: 'lectAnterior', width: 18 },
          { header: 'Lectura Actual', key: 'lectActual', width: 18 },
          { header: 'Consumo (m³)', key: 'consumo', width: 16 },
          { header: 'Valor Emisión ($)', key: 'valEmision', width: 18 },
          { header: 'Abonos ($)', key: 'abonos', width: 16 },
          { header: 'Saldo Pendiente ($)', key: 'saldo', width: 20 },
        ];
        return { columns, rows, sheetName: 'Historial Conexión' };
      }

      case 'account-statement': {
        const rows: any[] = [];
        const years = reporte?.years || [];
        for (const year of years) {
          for (const m of year.meses || []) {
            rows.push({
              ano: year.nombre || '—',
              mes: m.mes || '—',
              lectAnterior: m.lectAnterior || '0',
              lectActual: m.lectActual || '0',
              consu: m.consu || '0',
              excede: m.excede || '0',
              cargoFijo: m.cargoFijo || '0.00',
              excedenteValor: m.excedenteValor || '0.00',
              totalMes: m.totalMes || '0.00',
              pagos: m.pagos || '0.00',
              saldo: m.saldo || '0.00',
            });
          }
        }
        const columns: ColumnDefinition[] = [
          { header: 'Año / Período', key: 'ano', width: 16 },
          { header: 'Mes', key: 'mes', width: 12 },
          { header: 'Lectura Anterior', key: 'lectAnterior', width: 16 },
          { header: 'Lectura Actual', key: 'lectActual', width: 16 },
          { header: 'Consumo (m³)', key: 'consu', width: 16 },
          { header: 'Excedente (m³)', key: 'excede', width: 16 },
          { header: 'Cargo Fijo ($)', key: 'cargoFijo', width: 16 },
          { header: 'Excedente ($)', key: 'excedenteValor', width: 16 },
          { header: 'Total Facturado ($)', key: 'totalMes', width: 18 },
          { header: 'Pagos Realizados ($)', key: 'pagos', width: 18 },
          { header: 'Saldo Acumulado ($)', key: 'saldo', width: 20 },
        ];
        return { columns, rows, sheetName: 'Estado de Cuenta' };
      }

      case 'overdue-accounts': {
        const rows = reporte?.cuentas || [];
        const columns: ColumnDefinition[] = [
          { header: 'Identificación', key: 'identificacion', width: 16 },
          { header: 'Cliente', key: 'clienteNombre', width: 30 },
          { header: 'N° Guía / Contrato', key: 'numeroGuia', width: 18 },
          { header: 'Sector', key: 'sectorNombre', width: 20 },
          { header: 'Medidor', key: 'medidorSerie', width: 16 },
          { header: 'Facturas Vencidas', key: 'facturasVencidas', width: 18 },
          { header: 'Deuda Total ($)', key: 'deudaTotal', width: 18 },
        ];
        return { columns, rows, sheetName: 'Cuentas Vencidas' };
      }

      case 'payment-agreement': {
        const c = document?.convenio || {};
        const rows = [
          {
            fecha: c.fecha,
            numeroGuia: c.numeroGuia,
            clienteNombre: c.clienteNombre,
            clienteCI: c.clienteCI,
            deudaTotal: c.deudaTotal,
            abonoInicial: c.abonoInicial,
            numeroCuotas: c.numeroCuotas,
            cuotaMensual: c.cuotaMensual,
            primeraCuota: c.primeraCuota,
            periodoInicio: c.periodoInicio,
          },
        ];
        const columns: ColumnDefinition[] = [
          { header: 'Fecha', key: 'fecha', width: 14 },
          { header: 'N° Guía', key: 'numeroGuia', width: 16 },
          { header: 'Cliente', key: 'clienteNombre', width: 30 },
          { header: 'Cédula / RUC', key: 'clienteCI', width: 16 },
          { header: 'Deuda Total ($)', key: 'deudaTotal', width: 16 },
          { header: 'Abono Inicial ($)', key: 'abonoInicial', width: 16 },
          { header: 'N° Cuotas', key: 'numeroCuotas', width: 12 },
          { header: 'Cuota Mensual ($)', key: 'cuotaMensual', width: 16 },
          { header: 'Primera Cuota ($)', key: 'primeraCuota', width: 16 },
          { header: 'Inicio Pagos', key: 'periodoInicio', width: 20 },
        ];
        return { columns, rows, sheetName: 'Convenio' };
      }

      default: {
        return { columns: [], rows: [], sheetName: 'Reporte' };
      }
    }
  }
}
