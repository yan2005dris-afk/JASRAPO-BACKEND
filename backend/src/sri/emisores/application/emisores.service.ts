import { Injectable } from '@nestjs/common';
import {
  EntityNotFoundException,
  EntityAlreadyExistsException,
  InvalidDomainOperationException,
} from '../../../shared/domain/exceptions/domain.exception';
import type {
  CreateEmisorDto,
  UpdateEmisorDto,
  EmisorResponseDto,
} from '../interfaces/dto/emisor.dto';
import { parsePKCS12 } from 'node:crypto';
import { extractSigningCertificate } from '../../../shared/utils/p12-certificate.util';
import { EncryptionService } from '../../../infrastructure/encryption/encryption.service';
import { EmisorRepository } from '../domain/repositories/emisor.repository';
import { EmisorRecord } from '../../domain/interfaces/repository.interface';
import {
  StorageService,
  SRI_STORAGE_TYPES,
} from '../../../infrastructure/storage/storage.service';
import { XmlSignerService } from '../../emision/infrastructure/xml/xml-signer.service';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';

@LogContext()
@Injectable()
export class EmisoresService {
  constructor(
    private readonly repository: EmisorRepository,
    private readonly encryptionService: EncryptionService,
    private readonly storageService: StorageService,
    private readonly xmlSignerService: XmlSignerService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Obtiene un registro de emisor por ID.
   */
  private async findRecordById(id: number): Promise<EmisorRecord> {
    const emisor = await this.repository.findById(id);

    if (!emisor) {
      throw new EntityNotFoundException('Emisor', id);
    }

    return emisor;
  }

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
   * Normaliza estado a mayúsculas
   */
  private toEstadoNormalizado(estado?: string): string {
    if (!estado) return 'ACTIVO';
    return estado.toUpperCase();
  }

  async findAll(): Promise<EmisorResponseDto[]> {
    const emisores = await this.repository.findAll();
    return emisores.map((row) => this.mapToResponse(row));
  }

  async findOne(id: number): Promise<EmisorResponseDto> {
    const emisor = await this.findRecordById(id);
    return this.mapToResponse(emisor);
  }

  /**
   * Valida acceso a un emisor por ID.
   * Retorna el emisor o lanza EntityNotFoundException.
   */
  async validateEmisorAccess(emisorId: number): Promise<EmisorResponseDto> {
    return this.findOne(emisorId);
  }

  /**
   * Valida acceso a un emisor por RUC.
   * Retorna el emisor o lanza EntityNotFoundException.
   */
  async validateRucAccess(ruc: string): Promise<EmisorResponseDto> {
    const emisor = await this.findByRuc(ruc);

    if (!emisor) {
      throw new EntityNotFoundException('Emisor', ruc);
    }

    return emisor;
  }

  async findByRuc(ruc: string): Promise<EmisorResponseDto | null> {
    const emisor = await this.repository.findByRuc(ruc);
    if (!emisor) return null;
    return this.mapToResponse(emisor);
  }

  async create(dto: CreateEmisorDto): Promise<EmisorResponseDto> {
    // Verificar si ya existe
    const existing = await this.findByRuc(dto.ruc);
    if (existing) {
      throw new EntityAlreadyExistsException('Emisor', 'RUC', dto.ruc);
    }

    const emisor = await this.repository.create({
      ruc: dto.ruc,
      razon_social: dto.razonSocial,
      nombre_comercial: dto.nombreComercial ?? undefined,
      direccion_matriz: dto.direccionMatriz,
      obligado_contabilidad: dto.obligadoContabilidad ?? false,
      contribuyente_especial: dto.contribuyenteEspecial ?? undefined,
      agente_retencion: dto.agenteRetencion ?? undefined,
      contribuyente_rimpe: dto.contribuyenteRimpe ?? false,
      ambiente: this.toAmbienteCodigo(dto.ambiente),
      estado: 'ACTIVO',
    });

    this.logger.log(`Emisor creado: ${dto.ruc} - ${dto.razonSocial}`);
    return this.mapToResponse(emisor);
  }

  async update(id: number, dto: UpdateEmisorDto): Promise<EmisorResponseDto> {
    // Verificar que existe y obtener el registro para usar su ID numérico
    const emisorActual = await this.findRecordById(id);

    const updateData: Partial<EmisorRecord> = {};

    if (dto.razonSocial !== undefined)
      updateData.razon_social = dto.razonSocial;
    if (dto.nombreComercial !== undefined)
      updateData.nombre_comercial = dto.nombreComercial;
    if (dto.direccionMatriz !== undefined)
      updateData.direccion_matriz = dto.direccionMatriz;
    if (dto.obligadoContabilidad !== undefined)
      updateData.obligado_contabilidad = dto.obligadoContabilidad;
    if (dto.contribuyenteEspecial !== undefined)
      updateData.contribuyente_especial = dto.contribuyenteEspecial;
    if (dto.agenteRetencion !== undefined)
      updateData.agente_retencion = dto.agenteRetencion;
    if (dto.contribuyenteRimpe !== undefined)
      updateData.contribuyente_rimpe = dto.contribuyenteRimpe;
    if (dto.ambiente !== undefined)
      updateData.ambiente = this.toAmbienteCodigo(dto.ambiente);
    if (dto.estado !== undefined)
      updateData.estado = this.toEstadoNormalizado(dto.estado);

    if (Object.keys(updateData).length === 0) {
      return this.mapToResponse(emisorActual);
    }

    const emisor = await this.repository.update(emisorActual.id, updateData);

    this.logger.log(`Emisor actualizado: ${id}`);
    return this.mapToResponse(emisor);
  }

  async delete(id: number): Promise<EmisorResponseDto> {
    // Verificar que existe
    const emisorActual = await this.findRecordById(id);

    // Verificar si ya está inactivo
    if (emisorActual.estado.toUpperCase() === 'INACTIVO') {
      throw new InvalidDomainOperationException(
        `El emisor ya se encuentra inactivo`,
      );
    }

    // Eliminación lógica: cambiar estado a inactivo
    const updated = await this.repository.update(emisorActual.id, {
      estado: 'INACTIVO',
    });

    this.logger.log(`Emisor inactivado: ${id}`);
    return this.mapToResponse(updated);
  }

  async uploadCertificado(
    id: number,
    file: Buffer,
    password: string,
  ): Promise<EmisorResponseDto> {
    // Verificar que existe y obtener el registro
    const emisorActual = await this.findRecordById(id);

    // Validar el certificado P12
    let certificateInfo: { validoHasta: Date; sujeto: string };
    try {
      certificateInfo = this.extractCertificateInfo(file, password);
    } catch (error) {
      throw new InvalidDomainOperationException(
        `Error al procesar el certificado: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    // 1. Guardar el archivo en RustFS (S3)
    const bucket = await this.storageService.ensureBucketForRuc(
      emisorActual.ruc,
      SRI_STORAGE_TYPES.CERTS,
    );
    const fileName = `cert_${emisorActual.id}.p12`;

    await this.storageService.upload(bucket, fileName, file, {
      contentType: 'application/x-pkcs12',
    });

    // 2. Guardar metadata en la base de datos
    const emisor = await this.repository.update(emisorActual.id, {
      certificado_nombre: fileName,
      certificado_password_encrypted:
        await this.encryptionService.encrypt(password),
      certificado_valido_hasta: certificateInfo.validoHasta,
      certificado_sujeto: certificateInfo.sujeto,
    });

    // 3. Limpiar cache de firma para este emisor
    this.xmlSignerService.clearEmisorCache(emisorActual.ruc);

    this.logger.log(`Certificado cargado en RustFS para emisor: ${id}`);
    return this.mapToResponse(emisor);
  }

  async deleteCertificado(id: number): Promise<EmisorResponseDto> {
    // Verificar que existe
    const emisorActual = await this.findRecordById(id);

    // 1. Eliminar de RustFS si existe
    if (emisorActual.certificado_nombre) {
      try {
        const bucket = await this.storageService.ensureBucketForRuc(
          emisorActual.ruc,
          SRI_STORAGE_TYPES.CERTS,
        );
        await this.storageService.delete(
          bucket,
          emisorActual.certificado_nombre,
        );
      } catch (error) {
        this.logger.warn(
          `No se pudo eliminar el archivo físico del certificado: ${error.message}`,
        );
      }
    }

    // 2. Limpiar metadata en BD
    const emisor = await this.repository.update(emisorActual.id, {
      certificado_nombre: null,
      certificado_password_encrypted: null,
      certificado_valido_hasta: null,
      certificado_sujeto: null,
    });

    // 3. Limpiar cache de firma para este emisor
    this.xmlSignerService.clearEmisorCache(emisorActual.ruc);

    this.logger.log(`Certificado eliminado de RustFS para emisor: ${id}`);
    return this.mapToResponse(emisor);
  }

  private extractCertificateInfo(
    p12Buffer: Buffer,
    password: string,
  ): { validoHasta: Date; sujeto: string } {
    const p12 = parsePKCS12(p12Buffer, { passphrase: password });
    const { signingCert } = extractSigningCertificate(p12);

    if (!signingCert) {
      throw new Error('No se encontró certificado en el archivo P12');
    }

    const validoHasta = new Date(signingCert.validTo);
    const sujeto = signingCert.subject
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .join(', ');

    return { validoHasta, sujeto };
  }

  private mapToResponse(row: EmisorRecord): EmisorResponseDto {
    return {
      id: row.id.toString(),
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
      tieneCertificado: !!row.certificado_nombre,
      certificadoValidoHasta: row.certificado_valido_hasta?.toISOString?.(),
      certificadoSujeto: row.certificado_sujeto,
      createdAt: row.createdAt?.toISOString?.() || new Date().toISOString(),
      updatedAt: row.updatedAt?.toISOString?.() || new Date().toISOString(),
    };
  }
}
