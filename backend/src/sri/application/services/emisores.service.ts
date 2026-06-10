import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { RawPgService } from '../../../infrastructure/database/raw-pg/raw-pg.service';
import { CreateEmisorDto, UpdateEmisorDto, EmisorResponseDto } from '../../interfaces/dto';
import * as forge from 'node-forge';
import { EncryptionService } from '../../../infrastructure/encryption/encryption.service';

@Injectable()
export class EmisoresService {
  private readonly logger = new Logger(EmisoresService.name);

  constructor(
    private readonly db: RawPgService,
    private readonly encryptionService: EncryptionService,
  ) {}

  /**
   * Convierte ambiente legible a código SRI
   * pruebas -> 1, produccion -> 2
   */
  private toAmbienteCodigo(ambiente?: string): string {
    if (!ambiente) return '1'; // Default: pruebas
    if (ambiente === '1' || ambiente === '2') return ambiente;
    return ambiente.toLowerCase() === 'produccion' ? '2' : '1';
  }

  /**
   * Convierte código SRI a texto legible
   */
  private toAmbienteTexto(codigo: string): string {
    return codigo === '2' ? 'produccion' : 'pruebas';
  }

  /**
   * Normaliza estado a mayúsculas
   */
  private toEstadoNormalizado(estado?: string): string {
    if (!estado) return 'ACTIVO';
    return estado.toUpperCase();
  }

  async findAll(): Promise<EmisorResponseDto[]> {
    const result = await this.db.query(
      `SELECT id, ruc, razon_social, nombre_comercial, direccion_matriz,
              obligado_contabilidad, contribuyente_especial, agente_retencion,
              contribuyente_rimpe, ambiente, estado,
              certificado_p12 IS NOT NULL as tiene_certificado,
              certificado_valido_hasta, certificado_sujeto,
              created_at, updated_at
       FROM emisores
       ORDER BY created_at DESC`,
    );

    return result.rows.map((row) => this.mapToResponse(row));
  }

  async findOne(id: string): Promise<EmisorResponseDto> {
    const result = await this.db.query(
      `SELECT id, ruc, razon_social, nombre_comercial, direccion_matriz,
              obligado_contabilidad, contribuyente_especial, agente_retencion,
              contribuyente_rimpe, ambiente, estado,
              certificado_p12 IS NOT NULL as tiene_certificado,
              certificado_valido_hasta, certificado_sujeto,
              created_at, updated_at
       FROM emisores
       WHERE id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(`Emisor con ID ${id} no encontrado`);
    }

    return this.mapToResponse(result.rows[0]);
  }

  /**
   * Valida acceso a un emisor por ID.
   * Retorna el emisor o lanza NotFoundException.
   */
  async validateEmisorAccess(emisorId: string): Promise<EmisorResponseDto> {
    return this.findOne(emisorId);
  }

  /**
   * Valida acceso a un emisor por RUC.
   * Retorna el emisor o lanza NotFoundException.
   */
  async validateRucAccess(ruc: string): Promise<EmisorResponseDto> {
    const emisor = await this.findByRuc(ruc);

    if (!emisor) {
      throw new NotFoundException(`Emisor con RUC ${ruc} no encontrado`);
    }

    return emisor;
  }

  async findByRuc(ruc: string): Promise<EmisorResponseDto | null> {
    const result = await this.db.query(
      `SELECT id, ruc, razon_social, nombre_comercial, direccion_matriz,
              obligado_contabilidad, contribuyente_especial, agente_retencion,
              contribuyente_rimpe, ambiente, estado,
              certificado_p12 IS NOT NULL as tiene_certificado,
              certificado_valido_hasta, certificado_sujeto,
              created_at, updated_at
       FROM emisores
       WHERE ruc = $1`,
      [ruc],
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapToResponse(result.rows[0]);
  }

  async create(dto: CreateEmisorDto): Promise<EmisorResponseDto> {
    // Verificar si ya existe
    const existing = await this.findByRuc(dto.ruc);
    if (existing) {
      throw new BadRequestException(`Ya existe un emisor con RUC ${dto.ruc}`);
    }

    const result = await this.db.query(
      `INSERT INTO emisores (
        ruc, razon_social, nombre_comercial, direccion_matriz,
        obligado_contabilidad, contribuyente_especial, agente_retencion,
        contribuyente_rimpe, ambiente, estado
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'ACTIVO')
      RETURNING id, ruc, razon_social, nombre_comercial, direccion_matriz,
                obligado_contabilidad, contribuyente_especial, agente_retencion,
                contribuyente_rimpe, ambiente, estado,
                false as tiene_certificado,
                null as certificado_valido_hasta, null as certificado_sujeto,
                created_at, updated_at`,
      [
        dto.ruc,
        dto.razonSocial,
        dto.nombreComercial || null,
        dto.direccionMatriz,
        dto.obligadoContabilidad ?? false,
        dto.contribuyenteEspecial || null,
        dto.agenteRetencion || null,
        dto.contribuyenteRimpe ?? false,
        this.toAmbienteCodigo(dto.ambiente),
      ],
    );

    this.logger.log(`Emisor creado: ${dto.ruc} - ${dto.razonSocial}`);
    return this.mapToResponse(result.rows[0]);
  }

  async update(id: string, dto: UpdateEmisorDto): Promise<EmisorResponseDto> {
    // Verificar que existe
    await this.findOne(id);

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (dto.razonSocial !== undefined) {
      updates.push(`razon_social = $${paramIndex++}`);
      values.push(dto.razonSocial);
    }
    if (dto.nombreComercial !== undefined) {
      updates.push(`nombre_comercial = $${paramIndex++}`);
      values.push(dto.nombreComercial);
    }
    if (dto.direccionMatriz !== undefined) {
      updates.push(`direccion_matriz = $${paramIndex++}`);
      values.push(dto.direccionMatriz);
    }
    if (dto.obligadoContabilidad !== undefined) {
      updates.push(`obligado_contabilidad = $${paramIndex++}`);
      values.push(dto.obligadoContabilidad);
    }
    if (dto.contribuyenteEspecial !== undefined) {
      updates.push(`contribuyente_especial = $${paramIndex++}`);
      values.push(dto.contribuyenteEspecial);
    }
    if (dto.agenteRetencion !== undefined) {
      updates.push(`agente_retencion = $${paramIndex++}`);
      values.push(dto.agenteRetencion);
    }
    if (dto.contribuyenteRimpe !== undefined) {
      updates.push(`contribuyente_rimpe = $${paramIndex++}`);
      values.push(dto.contribuyenteRimpe);
    }
    if (dto.ambiente !== undefined) {
      updates.push(`ambiente = $${paramIndex++}`);
      values.push(this.toAmbienteCodigo(dto.ambiente));
    }
    if (dto.estado !== undefined) {
      updates.push(`estado = $${paramIndex++}`);
      values.push(this.toEstadoNormalizado(dto.estado));
    }

    if (updates.length === 0) {
      return this.findOne(id);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await this.db.query(
      `UPDATE emisores SET ${updates.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING id, ruc, razon_social, nombre_comercial, direccion_matriz,
                 obligado_contabilidad, contribuyente_especial, agente_retencion,
                 contribuyente_rimpe, ambiente, estado,
                 certificado_p12 IS NOT NULL as tiene_certificado,
                 certificado_valido_hasta, certificado_sujeto,
                 created_at, updated_at`,
      values,
    );

    this.logger.log(`Emisor actualizado: ${id}`);
    return this.mapToResponse(result.rows[0]);
  }

  async delete(id: string): Promise<EmisorResponseDto> {
    // Verificar que existe
    const emisor = await this.findOne(id);

    // Verificar si ya está inactivo
    if (emisor.estado.toUpperCase() === 'INACTIVO') {
      throw new BadRequestException(`El emisor ya se encuentra inactivo`);
    }

    // Eliminación lógica: cambiar estado a inactivo
    const result = await this.db.query(
      `UPDATE emisores SET 
        estado = 'INACTIVO',
        updated_at = NOW()
       WHERE id = $1
       RETURNING id, ruc, razon_social, nombre_comercial, direccion_matriz,
                 obligado_contabilidad, contribuyente_especial, agente_retencion,
                 contribuyente_rimpe, ambiente, estado,
                 certificado_p12 IS NOT NULL as tiene_certificado,
                 certificado_valido_hasta, certificado_sujeto,
                 created_at, updated_at`,
      [id],
    );

    this.logger.log(`Emisor inactivado: ${id}`);
    return this.mapToResponse(result.rows[0]);
  }

  async uploadCertificado(
    id: string,
    file: Buffer,
    password: string,
  ): Promise<EmisorResponseDto> {
    // Verificar que existe
    await this.findOne(id);

    // Validar el certificado P12
    let certificateInfo: { validoHasta: Date; sujeto: string };
    try {
      certificateInfo = this.extractCertificateInfo(file, password);
    } catch (error) {
      throw new BadRequestException(
        `Error al procesar el certificado: ${error.message}`,
      );
    }

    // Guardar el certificado
    const result = await this.db.query(
      `UPDATE emisores SET
        certificado_p12 = $1,
        certificado_password = $2,
        certificado_valido_hasta = $3,
        certificado_sujeto = $4,
        certificado_updated_at = NOW(),
        updated_at = NOW()
       WHERE id = $5
       RETURNING id, ruc, razon_social, nombre_comercial, direccion_matriz,
                 obligado_contabilidad, contribuyente_especial, agente_retencion,
                 contribuyente_rimpe, ambiente, estado,
                 true as tiene_certificado,
                 certificado_valido_hasta, certificado_sujeto,
                 created_at, updated_at`,
      [
        file,
        await this.encryptionService.encrypt(password),
        certificateInfo.validoHasta,
        certificateInfo.sujeto,
        id,
      ],
    );

    this.logger.log(`Certificado cargado para emisor: ${id}`);
    return this.mapToResponse(result.rows[0]);
  }

  async deleteCertificado(id: string): Promise<EmisorResponseDto> {
    // Verificar que existe
    await this.findOne(id);

    const result = await this.db.query(
      `UPDATE emisores SET
        certificado_p12 = NULL,
        certificado_password = NULL,
        certificado_valido_hasta = NULL,
        certificado_sujeto = NULL,
        certificado_updated_at = NULL,
        updated_at = NOW()
       WHERE id = $1
       RETURNING id, ruc, razon_social, nombre_comercial, direccion_matriz,
                 obligado_contabilidad, contribuyente_especial, agente_retencion,
                 contribuyente_rimpe, ambiente, estado,
                 false as tiene_certificado,
                 null as certificado_valido_hasta, null as certificado_sujeto,
                 created_at, updated_at`,
      [id],
    );

    this.logger.log(`Certificado eliminado para emisor: ${id}`);
    return this.mapToResponse(result.rows[0]);
  }

  private extractCertificateInfo(
    p12Buffer: Buffer,
    password: string,
  ): { validoHasta: Date; sujeto: string } {
    const p12Asn1 = forge.asn1.fromDer(p12Buffer.toString('binary'));
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);

    const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
    const certBag = certBags[forge.pki.oids.certBag];

    if (!certBag || certBag.length === 0) {
      throw new Error('No se encontró certificado en el archivo P12');
    }

    const cert = certBag[0].cert;
    if (!cert) {
      throw new Error('Certificado inválido');
    }

    const validoHasta = cert.validity.notAfter;
    const sujeto = cert.subject.attributes
      .map((attr) => `${String(attr.shortName)}=${String(attr.value)}`)
      .join(', ');

    return { validoHasta, sujeto };
  }

  private mapToResponse(row: any): EmisorResponseDto {
    return {
      id: row.id,
      ruc: row.ruc,
      razonSocial: row.razon_social,
      nombreComercial: row.nombre_comercial,
      direccionMatriz: row.direccion_matriz,
      obligadoContabilidad: row.obligado_contabilidad,
      contribuyenteEspecial: row.contribuyente_especial,
      agenteRetencion: row.agente_retencion,
      contribuyenteRimpe: row.contribuyente_rimpe,
      ambiente: row.ambiente,
      estado: row.estado,
      tieneCertificado: row.tiene_certificado,
      certificadoValidoHasta: row.certificado_valido_hasta?.toISOString(),
      certificadoSujeto: row.certificado_sujeto,
      createdAt: row.created_at?.toISOString(),
      updatedAt: row.updated_at?.toISOString(),
    };
  }
}
