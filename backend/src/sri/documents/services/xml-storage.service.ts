import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MinioStorageService,
  getBucketName,
  SRI_STORAGE_TYPES,
} from '../../../infrastructure/storage/minio-storage.service';
import { Readable } from 'stream';

/**
 * Service for storing XML files using IStorageService abstraction
 * Organizes files by RUC/year/month for easy retrieval and 7-year retention
 * Uses MinIO with filesystem fallback
 */
@Injectable()
export class XmlStorageService {
  private readonly logger = new Logger(XmlStorageService.name);
  private readonly baseDir: string;

  constructor(
    private readonly storageService: MinioStorageService,
    private readonly configService: ConfigService,
  ) {
    this.baseDir =
      this.configService.get<string>('XMLS_DIR', '../xmls');
    this.logger.log(`XmlStorageService initialized with MinIO storage`);
  }

  /**
   * Generates the bucket name for a given RUC
   */
  private getBucketForRuc(ruc: string): string {
    return getBucketName(ruc, SRI_STORAGE_TYPES.XMLS);
  }

  /**
   * Generates the storage key based on RUC, date, and type
   * Format: {ruc}/{year}/{month}/{subdir}/{claveAcceso}.xml
   */
  private getStorageKey(
    ruc: string,
    fechaEmision: Date,
    tipo: 'sin_firmar' | 'firmados' | 'autorizados',
    claveAcceso: string,
  ): string {
    const year = fechaEmision.getFullYear().toString();
    const month = (fechaEmision.getMonth() + 1).toString().padStart(2, '0');
    return `${ruc}/${year}/${month}/${tipo}/${claveAcceso}.xml`;
  }

  /**
   * Maps tipo to subdirectory name
   */
  private mapTipoToSubdir(
    tipo: 'sin_firma' | 'firmado' | 'autorizado',
  ): 'sin_firmar' | 'firmados' | 'autorizados' {
    const subdirMap: Record<
      'sin_firma' | 'firmado' | 'autorizado',
      'sin_firmar' | 'firmados' | 'autorizados'
    > = {
      sin_firma: 'sin_firmar',
      firmado: 'firmados',
      autorizado: 'autorizados',
    };
    return subdirMap[tipo];
  }

  /**
   * Saves an XML file and returns the relative storage key
   * Format: {ruc}/{year}/{month}/{subdir}/{claveAcceso}.xml
   */
  async saveXml(
    ruc: string,
    claveAcceso: string,
    fechaEmision: Date,
    tipo: 'sin_firma' | 'firmado' | 'autorizado',
    xmlContent: string,
  ): Promise<string> {
    const bucket = this.getBucketForRuc(ruc);
    const subdir = this.mapTipoToSubdir(tipo);
    const key = this.getStorageKey(ruc, fechaEmision, subdir, claveAcceso);

    const buffer = Buffer.from(xmlContent, 'utf-8');
    await this.storageService.upload(bucket, key, buffer, {
      contentType: 'application/xml',
    });

    this.logger.debug(`XML guardado en bucket ${bucket}: ${key}`);
    return key;
  }

  /**
   * Saves all XML versions for a comprobante
   */
  async saveAllXmls(
    ruc: string,
    claveAcceso: string,
    fechaEmision: Date,
    xmlSinFirma?: string,
    xmlFirmado?: string,
    xmlAutorizado?: string,
  ): Promise<{
    sinFirmaKey?: string;
    firmadoKey?: string;
    autorizadoKey?: string;
  }> {
    const keys: {
      sinFirmaKey?: string;
      firmadoKey?: string;
      autorizadoKey?: string;
    } = {};

    if (xmlSinFirma) {
      keys.sinFirmaKey = await this.saveXml(
        ruc,
        claveAcceso,
        fechaEmision,
        'sin_firma',
        xmlSinFirma,
      );
    }
    if (xmlFirmado) {
      keys.firmadoKey = await this.saveXml(
        ruc,
        claveAcceso,
        fechaEmision,
        'firmado',
        xmlFirmado,
      );
    }
    if (xmlAutorizado) {
      keys.autorizadoKey = await this.saveXml(
        ruc,
        claveAcceso,
        fechaEmision,
        'autorizado',
        xmlAutorizado,
      );
    }

    return keys;
  }

  /**
   * Reads an XML file by its relative storage key
   * Accepts the relative path stored in database (format: {ruc}/{year}/{month}/{subdir}/{claveAcceso}.xml)
   * @param relativePath The relative storage key
   */
  async readXml(relativePath: string): Promise<string | null> {
    try {
      // Extract RUC from the first segment of the path
      const pathParts = relativePath.split('/');
      if (pathParts.length < 5) {
        this.logger.warn(`Invalid relative path format: ${relativePath}`);
        return null;
      }
      const ruc = pathParts[0];
      const bucket = this.getBucketForRuc(ruc);
      const stream = await this.storageService.getObject(bucket, relativePath);
      return await this.streamToString(stream);
    } catch (error) {
      this.logger.warn(`Error reading XML: ${relativePath} - ${error.message}`);
      return null;
    }
  }

  /**
   * Converts a readable stream to string
   */
  private async streamToString(stream: Readable): Promise<string> {
    const chunks: string[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk.toString());
    }
    return chunks.join('');
  }

  /**
   * Gets a presigned URL for downloading the XML file
   * Accepts the relative path stored in database (format: {ruc}/{year}/{month}/{subdir}/{claveAcceso}.xml)
   * @param relativePath The relative storage key
   * @param expiresInSeconds URL expiration time (default: 24 hours)
   */
  async getFullPath(
    relativePath: string,
    expiresInSeconds = 86400,
  ): Promise<string> {
    // Extract RUC from the first segment of the path
    const pathParts = relativePath.split('/');
    if (pathParts.length < 5) {
      throw new Error(`Invalid relative path format: ${relativePath}`);
    }
    const ruc = pathParts[0];
    const bucket = this.getBucketForRuc(ruc);
    return await this.storageService.getUrl(
      bucket,
      relativePath,
      expiresInSeconds,
    );
  }

  /**
   * Refreshes the URL for an existing XML file (generates a new presigned URL)
   * Useful when the previous URL has expired
   * Accepts the relative path stored in database (format: {ruc}/{year}/{month}/{subdir}/{claveAcceso}.xml)
   */
  async refreshUrl(
    relativePath: string,
    expiresInSeconds = 86400,
  ): Promise<string> {
    // Extract RUC from the first segment of the path
    const pathParts = relativePath.split('/');
    if (pathParts.length < 5) {
      throw new Error(`Invalid relative path format: ${relativePath}`);
    }
    const ruc = pathParts[0];
    const bucket = this.getBucketForRuc(ruc);
    return await this.storageService.refreshUrl(
      bucket,
      relativePath,
      expiresInSeconds,
    );
  }
}
