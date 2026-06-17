import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import {
  CreateEmisorDto,
  UpdateEmisorDto,
  EmisorResponseDto,
} from '../../interfaces/dto';
import * as forge from 'node-forge';
import { EncryptionService } from '../../../infrastructure/encryption/encryption.service';

@Injectable()
export class EmisoresService {
  private readonly logger = new Logger(EmisoresService.name);

  constructor(
    private readonly prisma: PrismaService,
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
    const empresas = await this.prisma.empresa.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return empresas.map((row) => this.mapToResponse(row));
  }

  async findOne(id: string): Promise<EmisorResponseDto> {
    const empresa = await this.prisma.empresa.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!empresa) {
      throw new NotFoundException(`Emisor con ID ${id} no encontrado`);
    }

    return this.mapToResponse(empresa);
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
    const empresa = await this.prisma.empresa.findUnique({
      where: { ruc },
    });

    if (!empresa) return null;

    return this.mapToResponse(empresa);
  }

  async create(dto: CreateEmisorDto): Promise<EmisorResponseDto> {
    // Verificar si ya existe
    const existing = await this.findByRuc(dto.ruc);
    if (existing) {
      throw new BadRequestException(`Ya existe un emisor con RUC ${dto.ruc}`);
    }

    const empresa = await this.prisma.empresa.create({
      data: {
        ruc: dto.ruc,
        razonSocial: dto.razonSocial,
        nombreComercial: dto.nombreComercial ?? undefined,
        direccionMatriz: dto.direccionMatriz,
        obligadoContabilidad: dto.obligadoContabilidad ?? false,
        contribuyenteEspecial: dto.contribuyenteEspecial ?? undefined,
        agenteRetencion: dto.agenteRetencion ?? undefined,
        contribuyenteRimpe: dto.contribuyenteRimpe ?? false,
        ambiente: this.toAmbienteCodigo(dto.ambiente),
        estado: 'ACTIVO',
      },
    });

    this.logger.log(`Emisor creado: ${dto.ruc} - ${dto.razonSocial}`);
    return this.mapToResponse(empresa);
  }

  async update(id: string, dto: UpdateEmisorDto): Promise<EmisorResponseDto> {
    // Verificar que existe
    await this.findOne(id);

    const updateData: Record<string, any> = {};

    if (dto.razonSocial !== undefined) updateData.razonSocial = dto.razonSocial;
    if (dto.nombreComercial !== undefined) updateData.nombreComercial = dto.nombreComercial;
    if (dto.direccionMatriz !== undefined) updateData.direccionMatriz = dto.direccionMatriz;
    if (dto.obligadoContabilidad !== undefined) updateData.obligadoContabilidad = dto.obligadoContabilidad;
    if (dto.contribuyenteEspecial !== undefined) updateData.contribuyenteEspecial = dto.contribuyenteEspecial;
    if (dto.agenteRetencion !== undefined) updateData.agenteRetencion = dto.agenteRetencion;
    if (dto.contribuyenteRimpe !== undefined) updateData.contribuyenteRimpe = dto.contribuyenteRimpe;
    if (dto.ambiente !== undefined) updateData.ambiente = this.toAmbienteCodigo(dto.ambiente);
    if (dto.estado !== undefined) updateData.estado = this.toEstadoNormalizado(dto.estado);

    if (Object.keys(updateData).length === 0) {
      return this.findOne(id);
    }

    const empresa = await this.prisma.empresa.update({
      where: { id: parseInt(id, 10) },
      data: updateData,
    });

    this.logger.log(`Emisor actualizado: ${id}`);
    return this.mapToResponse(empresa);
  }

  async delete(id: string): Promise<EmisorResponseDto> {
    // Verificar que existe
    const emisor = await this.findOne(id);

    // Verificar si ya está inactivo
    if (emisor.estado.toUpperCase() === 'INACTIVO') {
      throw new BadRequestException(`El emisor ya se encuentra inactivo`);
    }

    // Eliminación lógica: cambiar estado a inactivo
    const empresa = await this.prisma.empresa.update({
      where: { id: parseInt(id, 10) },
      data: { estado: 'INACTIVO' },
    });

    this.logger.log(`Emisor inactivado: ${id}`);
    return this.mapToResponse(empresa);
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

    // Guardar el certificado (almacenamos nombre del archivo + password encriptado)
    const empresa = await this.prisma.empresa.update({
      where: { id: parseInt(id, 10) },
      data: {
        certificadoNombre: `cert_${id}.p12`,
        certificadoPassword: await this.encryptionService.encrypt(password),
        certificadoValidoHasta: certificateInfo.validoHasta,
        certificadoSujeto: certificateInfo.sujeto,
      },
    });

    this.logger.log(`Certificado cargado para emisor: ${id}`);
    return this.mapToResponse(empresa);
  }

  async deleteCertificado(id: string): Promise<EmisorResponseDto> {
    // Verificar que existe
    await this.findOne(id);

    const empresa = await this.prisma.empresa.update({
      where: { id: parseInt(id, 10) },
      data: {
        certificadoNombre: null,
        certificadoPassword: null,
        certificadoValidoHasta: null,
        certificadoSujeto: null,
      },
    });

    this.logger.log(`Certificado eliminado para emisor: ${id}`);
    return this.mapToResponse(empresa);
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
      razonSocial: row.razonSocial ?? row.razon_social,
      nombreComercial: row.nombreComercial ?? row.nombre_comercial,
      direccionMatriz: row.direccionMatriz ?? row.direccion_matriz,
      obligadoContabilidad: row.obligadoContabilidad ?? row.obligado_contabilidad,
      contribuyenteEspecial: row.contribuyenteEspecial ?? row.contribuyente_especial,
      agenteRetencion: row.agenteRetencion ?? row.agente_retencion,
      contribuyenteRimpe: row.contribuyenteRimpe ?? row.contribuyente_rimpe,
      ambiente: row.ambiente,
      estado: row.estado,
      tieneCertificado: !!(row.certificadoNombre ?? row.certificado_nombre),
      certificadoValidoHasta: (row.certificadoValidoHasta ?? row.certificado_valido_hasta)?.toISOString?.(),
      certificadoSujeto: row.certificadoSujeto ?? row.certificado_sujeto,
      createdAt: (row.createdAt ?? row.created_at)?.toISOString?.(),
      updatedAt: (row.updatedAt ?? row.updated_at)?.toISOString?.(),
    };
  }
}
