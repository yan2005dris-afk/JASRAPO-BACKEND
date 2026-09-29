import type { PdfDocumentType } from 'src/infrastructure/pdf/document-type.interface';
import { currentDateLabel } from 'src/infrastructure/pdf/utils/pdf-format.utils';

export interface FieldSheetData {
  ruta: {
    rutaId: bigint | number;
    nombre: string;
    tipoRuta: string;
    descripcion?: string | null;
    estado: string;
    comunidadNombre?: string;
    sectorNombre?: string;
    operarioNombre?: string;
    periodoNombre?: string;
  };
  isLectura: boolean;
  items: Array<{
    ordenVisita?: number;
    guia?: string;
    contrato?: string;
    cliente: string;
    direccion: string;
    medidor: string;
    lecturaAnterior?: string | number;
    tipoActividad?: string;
    estado?: string;
  }>;
  kpis: {
    total: number;
    pendientes: number;
    completadas: number;
    conNovedad: number;
  };
}

const TIPO_RUTA_LABELS: Record<string, string> = {
  LECTURA: 'Toma de Lecturas',
  INSTALACION: 'Instalación de Medidores',
  CORTE: 'Corte de Servicio',
  RECONEXION: 'Reconexión de Servicio',
  MANTENIMIENTO: 'Mantenimiento / Inspección',
};

export const FieldSheetPdfDocumentType: PdfDocumentType = {
  type: 'field-sheet',
  name: 'Hoja de Campo para Operarios',
  template: 'field-sheet',

  adaptData(raw: Record<string, unknown>): Record<string, unknown> {
    const data = raw as unknown as FieldSheetData;
    const ruta = data.ruta;

    return {
      reporte: {
        rutaId: ruta.rutaId.toString(),
        rutaNombre: ruta.nombre,
        tipoRuta: ruta.tipoRuta,
        tipoRutaLabel: TIPO_RUTA_LABELS[ruta.tipoRuta] ?? ruta.tipoRuta,
        descripcion: ruta.descripcion || 'Sin instrucciones adicionales',
        estado: ruta.estado,
        comunidad: ruta.comunidadNombre || 'Comunidad General',
        sector: ruta.sectorNombre || '',
        operario: ruta.operarioNombre || 'Sin operario asignado',
        periodo: ruta.periodoNombre || 'Período Activo',
        fechaEmision: currentDateLabel(),
        isLectura: data.isLectura,
        items: data.items,
        total: data.kpis.total,
        pendientes: data.kpis.pendientes,
        completadas: data.kpis.completadas,
        conNovedad: data.kpis.conNovedad,
      },
    };
  },
};
