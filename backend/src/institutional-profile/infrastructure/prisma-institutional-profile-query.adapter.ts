import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { InstitutionalProfileQueryPort } from '../application/ports/institutional-profile.ports';
import type {
  InstitutionalAssetReference,
  InstitutionalLegalTexts,
  InstitutionalLocation,
  InstitutionalPhone,
  InstitutionalProfile,
  InstitutionalRepresentative,
} from '../domain/institutional-profile.types';

interface InstitutionalProfileRow {
  perfilInstitucionalId: bigint;
  version: string;
  vigenteDesde: Date;
  vigenteHasta: Date | null;
  nombreLegal: string;
  nombreComercial: string;
  siglas: string;
  ruc: string;
  decretoNumero: string | null;
  decretoFecha: Date | null;
  registroOficialNumero: string | null;
  registroOficialFecha: Date | null;
  fechaFundacion: Date | null;
  direccion: string;
  ubicacion: unknown;
  correo: string;
  telefonos: unknown;
  representantes: unknown;
  logoReferencia: unknown;
  marcaAguaReferencia: unknown;
  textosLegales: unknown;
}

@Injectable()
export class PrismaInstitutionalProfileQueryAdapter extends InstitutionalProfileQueryPort {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findValidAt(at: Date): Promise<readonly InstitutionalProfile[]> {
    const activeEmisores = await this.prisma.$queryRaw<{ id: number }[]>(
      Prisma.sql`
        SELECT id FROM emisores WHERE estado = 'ACTIVO' LIMIT 2
      `,
    );

    if (activeEmisores.length === 0) {
      throw new NotFoundException(
        'No existe ningún emisor activo configurado en el sistema',
      );
    }

    if (activeEmisores.length > 1) {
      throw new ConflictException(
        'Existe más de un emisor activo configurado en el sistema; debe existir exactamente uno',
      );
    }

    const emisorId = activeEmisores[0].id;

    const rows = await this.prisma.$queryRaw<InstitutionalProfileRow[]>(
      Prisma.sql`
        SELECT
          p.perfil_institucional_id AS "perfilInstitucionalId",
          p.version,
          p.vigente_desde AS "vigenteDesde",
          p.vigente_hasta AS "vigenteHasta",
          e.razon_social AS "nombreLegal",
          COALESCE(e.nombre_comercial, e.razon_social) AS "nombreComercial",
          p.siglas,
          e.ruc,
          p.decreto_numero AS "decretoNumero",
          p.decreto_fecha AS "decretoFecha",
          p.registro_oficial_numero AS "registroOficialNumero",
          p.registro_oficial_fecha AS "registroOficialFecha",
          p.fecha_fundacion AS "fechaFundacion",
          e.direccion_matriz AS "direccion",
          p.ubicacion,
          p.correo,
          p.telefonos,
          p.representantes,
          p.logo_referencia AS "logoReferencia",
          p.marca_agua_referencia AS "marcaAguaReferencia",
          p.textos_legales AS "textosLegales"
        FROM perfiles_institucionales p
        JOIN emisores e ON e.id = p.emisor_id
        WHERE p.emisor_id = ${emisorId}
          AND p.vigente_desde <= ${at}
          AND (p.vigente_hasta IS NULL OR ${at} < p.vigente_hasta)
        ORDER BY p.vigente_desde DESC
        LIMIT 2
      `,
    );

    return rows.map((row) => this.mapRow(row));
  }

  private mapRow(row: InstitutionalProfileRow): InstitutionalProfile {
    try {
      return {
        ...row,
        ubicacion: this.parseLocation(row.ubicacion),
        telefonos: this.parsePhones(row.telefonos),
        representantes: this.parseRepresentatives(row.representantes),
        logoReferencia: this.parseAsset(row.logoReferencia),
        marcaAguaReferencia: this.parseAsset(row.marcaAguaReferencia),
        textosLegales: this.parseLegalTexts(row.textosLegales),
      };
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(
        `El perfil institucional ${row.version} contiene datos inválidos: ${detail}`,
      );
    }
  }

  private parseLocation(value: unknown): InstitutionalLocation {
    const object = this.asObject(value, 'ubicacion');
    return {
      localidad: this.asString(object.localidad, 'ubicacion.localidad'),
      parroquia: this.asString(object.parroquia, 'ubicacion.parroquia'),
      canton: this.asString(object.canton, 'ubicacion.canton'),
      provincia: this.asString(object.provincia, 'ubicacion.provincia'),
      pais: this.asString(object.pais, 'ubicacion.pais'),
    };
  }

  private parsePhones(value: unknown): InstitutionalPhone[] {
    return this.asArray(value, 'telefonos').map((item, index) => {
      const object = this.asObject(item, `telefonos[${index}]`);
      return {
        etiqueta: this.asString(
          object.etiqueta,
          `telefonos[${index}].etiqueta`,
        ),
        numero: this.asString(object.numero, `telefonos[${index}].numero`),
      };
    });
  }

  private parseRepresentatives(value: unknown): InstitutionalRepresentative[] {
    return this.asArray(value, 'representantes').map((item, index) => {
      const object = this.asObject(item, `representantes[${index}]`);
      if (typeof object.esPrincipal !== 'boolean') {
        throw new Error(
          `representantes[${index}].esPrincipal debe ser booleano`,
        );
      }
      return {
        nombres: this.asString(
          object.nombres,
          `representantes[${index}].nombres`,
        ),
        identificacion: this.asString(
          object.identificacion,
          `representantes[${index}].identificacion`,
        ),
        cargo: this.asString(object.cargo, `representantes[${index}].cargo`),
        esPrincipal: object.esPrincipal,
      };
    });
  }

  private parseAsset(value: unknown): InstitutionalAssetReference {
    const object = this.asObject(value, 'referencia de activo');
    return {
      contenedor: this.asString(object.contenedor, 'activo.contenedor'),
      clave: this.asString(object.clave, 'activo.clave'),
      tipoContenido: this.asString(
        object.tipoContenido,
        'activo.tipoContenido',
      ),
    };
  }

  private parseLegalTexts(value: unknown): InstitutionalLegalTexts {
    const root = this.asObject(value, 'textosLegales');
    const convenio = this.asObject(root.convenioPago, 'convenioPago');
    const acta = this.asObject(root.actaResponsabilidad, 'actaResponsabilidad');
    return {
      convenioPago: {
        introduccionOficina: this.asString(
          convenio.introduccionOficina,
          'convenioPago.introduccionOficina',
        ),
        compromisoUsuario: this.asString(
          convenio.compromisoUsuario,
          'convenioPago.compromisoUsuario',
        ),
        identificacionUsuario: this.asString(
          convenio.identificacionUsuario,
          'convenioPago.identificacionUsuario',
        ),
        cuotasMensuales: this.asString(
          convenio.cuotasMensuales,
          'convenioPago.cuotasMensuales',
        ),
        inicioConvenio: this.asString(
          convenio.inicioConvenio,
          'convenioPago.inicioConvenio',
        ),
        cumplimiento: this.asString(
          convenio.cumplimiento,
          'convenioPago.cumplimiento',
        ),
        pagoEfectivo: this.asString(
          convenio.pagoEfectivo,
          'convenioPago.pagoEfectivo',
        ),
        pagosPosteriores: this.asString(
          convenio.pagosPosteriores,
          'convenioPago.pagosPosteriores',
        ),
        primeraCuota: this.asString(
          convenio.primeraCuota,
          'convenioPago.primeraCuota',
        ),
        cierre: this.asString(convenio.cierre, 'convenioPago.cierre'),
      },
      actaResponsabilidad: {
        introduccionOficina: this.asString(
          acta.introduccionOficina,
          'actaResponsabilidad.introduccionOficina',
        ),
        compromisoUsuario: this.asString(
          acta.compromisoUsuario,
          'actaResponsabilidad.compromisoUsuario',
        ),
        clausulas: this.asArray(
          acta.clausulas,
          'actaResponsabilidad.clausulas',
        ).map((item, index) =>
          this.asString(item, `actaResponsabilidad.clausulas[${index}]`),
        ),
        cierre: this.asString(acta.cierre, 'actaResponsabilidad.cierre'),
      },
    };
  }

  private asObject(value: unknown, field: string): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new Error(`${field} debe ser un objeto`);
    }
    return value as Record<string, unknown>;
  }

  private asArray(value: unknown, field: string): unknown[] {
    if (!Array.isArray(value)) throw new Error(`${field} debe ser un arreglo`);
    return value;
  }

  private asString(value: unknown, field: string): string {
    if (typeof value !== 'string' || value.trim() === '') {
      throw new Error(`${field} debe ser un texto no vacío`);
    }
    return value;
  }
}
