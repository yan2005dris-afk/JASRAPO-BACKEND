import * as Minio from 'minio';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private minioClient: Minio.Client;

  /** Buckets que se crean automáticamente al iniciar el módulo */
  private readonly defaultBuckets = ['avatars', 'documents', 'uploads'];

  constructor(private configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT') || 'localhost',
      port: parseInt(this.configService.get<string>('MINIO_PORT') || '9000', 10),
      useSSL: this.configService.get<string>('MINIO_USE_SSL') === 'true',
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY') || 'admin',
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY') || 'password123',
    });
  }

  /**
   *  Al iniciar el módulo, verifica que los buckets predeterminados existan y los crea si no.
   *  Esto asegura que el sistema tenga los buckets necesarios para funcionar sin requerir configuración manual.
   */
  async onModuleInit() {
    for (const bucket of this.defaultBuckets) {
      try {
        const exists = await this.minioClient.bucketExists(bucket);
        if (!exists) {
          await this.minioClient.makeBucket(bucket);
          this.logger.log(`Bucket "${bucket}" creado`);
        }
      } catch (error) {
        this.logger.warn(`No se pudo verificar/crear bucket "${bucket}": ${error}`);
      }
    }
  }

  /**
   *  Sube un archivo a un bucket específico. Si el bucket no existe, se crea automáticamente.
   * @param bucketName  Nombre del bucket donde se subirá el archivo
   * @param fileName  Nombre del archivo a crear en MinIO (puede incluir prefijo/carpeta)
   * @param buffer  Contenido del archivo en formato Buffer
   * @returns El nombre del archivo subido (con prefijo si se proporcionó)
   * @throws Error si la subida falla por cualquier motivo
   * @returns 
   */
  async uploadFile(bucketName: string, fileName: string, buffer: Buffer): Promise<string> {
    await this.ensureBucket(bucketName);
    await this.minioClient.putObject(bucketName, fileName, buffer);
    return fileName;
  }

  /**
   *  Elimina un archivo de un bucket específico.
   * @param bucketName  Nombre del bucket del que se eliminará el archivo
   * @param fileName  Nombre del archivo a eliminar (con prefijo si se proporcionó al subir)
   * @returns void 
   * @throws Error si la eliminación falla por cualquier motivo, como que el archivo no exista o problemas de conexión
   */ 
  async deleteFile(bucketName: string, fileName: string): Promise<void> {
    await this.minioClient.removeObject(bucketName, fileName);
  }

  /**
   *  Verifica si un archivo existe en un bucket específico.
   * @param bucketName  Nombre del bucket donde se buscará el archivo
   * @param fileName  Nombre del archivo a verificar (con prefijo si se proporcionó al subir)
   * @returns   true si el archivo existe, false si no existe o si ocurre un error al verificar
   */
  async fileExists(bucketName: string, fileName: string): Promise<boolean> {
    try {
      await this.minioClient.statObject(bucketName, fileName);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Obtiene metadata de un archivo en un bucket específico, como tamaño, tipo de contenido y fecha de última modificación.
   * @param bucketName  Nombre del bucket donde se encuentra el archivo
   * @param fileName  Nombre del archivo del que se desea obtener la metadata (con prefijo si se proporcionó al subir)
   * @returns  Un objeto con la metadata del archivo o null si el archivo no existe o si ocurre un error al obtener la metadata
   */
  async getFileMetadata(bucketName: string, fileName: string): Promise<{ size: number; contentType: string; lastModified: Date } | null> {
    try {
      const stat = await this.minioClient.statObject(bucketName, fileName);
      return {
        size: stat.size,
        contentType: stat.metaData?.['content-type'] || 'application/octet-stream',
        lastModified: stat.lastModified,
      };
    } catch {
      return null;
    }
  }

  /**
   *  Genera una URL temporal (presigned) para acceder a un archivo en un bucket específico. La URL es válida por 24 horas.
   * @param bucketName  Nombre del bucket donde se encuentra el archivo
   * @param fileName  Nombre del archivo para el cual se generará la URL (con prefijo si se proporcionó al subir)
   * @returns Una URL presigned que permite acceder al archivo directamente desde MinIO sin necesidad de autenticación adicional, válida por 24 horas. Si ocurre un error al generar la URL, se lanzará una excepción.
   */
  async getPresignedUrl(bucketName: string, fileName: string): Promise<string> {
    return await this.minioClient.presignedGetObject(bucketName, fileName, 24 * 60 * 60);
  }

  /**
   *  Obtiene un stream de lectura para un archivo específico en un bucket. Esto es útil para servir archivos directamente al cliente sin cargar todo el contenido en memoria.
   * @param bucketName  Nombre del bucket donde se encuentra el archivo
   * @param fileName  Nombre del archivo del cual se desea obtener el stream (con prefijo si se proporcionó al subir)
   * @returns  Un stream de lectura del archivo solicitado. Si el archivo no existe o si ocurre un error al obtener el stream, se lanzará una excepción.
   */
  async getFileStream(bucketName: string, fileName: string): Promise<any> {
    return await this.minioClient.getObject(bucketName, fileName);
  }

  /**
   * Lista los archivos de un bucket específico, opcionalmente filtrados por un prefijo (como una carpeta). Devuelve una lista de nombres de archivos.
   * @param bucketName  Nombre del bucket del cual se desea listar los archivos
   * @param prefix  Prefijo opcional para filtrar los archivos listados (por ejemplo, "2026/" para listar solo archivos dentro de esa "carpeta")
   * @returns Una lista de nombres de archivos que existen en el bucket y que coinciden con el prefijo si se proporcionó. Si ocurre un error al listar los archivos, se lanzará una excepción.
   */
  async listFiles(bucketName: string, prefix?: string): Promise<string[]> {
    await this.ensureBucket(bucketName);
    return new Promise((resolve, reject) => {
      const files: string[] = [];
      const stream = this.minioClient.listObjects(bucketName, prefix || '', true);
      stream.on('data', (obj) => {
        if (obj.name) files.push(obj.name);
      });
      stream.on('error', reject);
      stream.on('end', () => resolve(files));
    });
  }

  /**
   *  Verifica si un bucket existe y lo crea si no existe. Esto se utiliza internamente antes de subir archivos para asegurar que el bucket esté disponible.
   * @param bucketName  Nombre del bucket que se desea verificar o crear
   */
  private async ensureBucket(bucketName: string): Promise<void> {
    const exists = await this.minioClient.bucketExists(bucketName);
    if (!exists) {
      await this.minioClient.makeBucket(bucketName);
    }
  }
}
