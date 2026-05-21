import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

/**
 * Servicio centralizado de encriptación/desencriptación AES-256-CBC.
 * Reubicado en infraestructura para uso global en la aplicación.
 *
 * Utiliza:
 * - ENCRYPTION_KEY (requerida): clave de 32 bytes para AES-256
 * - ENCRYPTION_SALT (requerida): salt para derivación de clave con scrypt
 *
 * Formato de salida: "iv_hex:encrypted_hex"
 */
@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly encryptionKey: string;
  private readonly encryptionSalt: string;
  private keyCache: Buffer | null = null;

  constructor(private readonly configService: ConfigService) {
    // Soporta tanto mayúsculas como minúsculas
    this.encryptionKey =
      this.configService.get<string>('encryptionKey') ||
      this.configService.get<string>('ENCRYPTION_KEY')!;
    this.encryptionSalt =
      this.configService.get<string>('encryptionSalt') ||
      this.configService.get<string>('ENCRYPTION_SALT')!;

    if (!this.encryptionKey || !this.encryptionSalt) {
      throw new Error(
        'ENCRYPTION_KEY y ENCRYPTION_SALT son requeridas. Defínelas en tu archivo .env',
      );
    }

    this.logger.log('EncryptionService inicializado correctamente');
  }

  /**
   * Deriva la clave de encriptación usando scrypt.
   * Cachea el resultado para evitar derivaciones repetidas.
   */
  private async deriveKey(): Promise<Buffer> {
    if (this.keyCache) {
      return this.keyCache;
    }

    const scryptAsync = promisify(scrypt);
    this.keyCache = (await scryptAsync(
      this.encryptionKey,
      this.encryptionSalt,
      32,
    )) as Buffer;

    return this.keyCache;
  }

  /**
   * Encripta un texto plano usando AES-256-CBC.
   * @param plainText - Texto a encriptar
   * @returns Texto encriptado en formato "iv_hex:encrypted_hex"
   */
  async encrypt(plainText: string): Promise<string> {
    const iv = randomBytes(12); // GCM standard IV size is 12 bytes
    const key = await this.deriveKey();
    const cipher = createCipheriv('aes-256-gcm', key, iv);

    const encrypted = Buffer.concat([
      cipher.update(plainText, 'utf8'),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    // Format: "iv_hex:auth_tag_hex:encrypted_hex"
    return (
      iv.toString('hex') +
      ':' +
      authTag.toString('hex') +
      ':' +
      encrypted.toString('hex')
    );
  }

  /**
   * Desencripta un texto encriptado con AES-256-GCM.
   * Soporta fallback para datos antiguos encriptados con AES-256-CBC.
   *
   * @param encryptedText - Texto en formato "iv:authTag:encrypted" (GCM) o "iv:encrypted" (CBC)
   * @returns Texto plano original
   */
  async decrypt(encryptedText: string): Promise<string> {
    const parts = encryptedText.split(':');

    // Fallback para AES-256-CBC (Formato antiguo: iv:encrypted)
    if (parts.length === 2) {
      return this.decryptCBC(parts[0], parts[1]);
    }

    if (parts.length !== 3) {
      throw new Error(
        'Formato de texto encriptado inválido. Se esperaba "iv:authTag:encrypted"',
      );
    }

    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const key = await this.deriveKey();

    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }

  /**
   * Legacy decryption for AES-256-CBC
   */
  private async decryptCBC(
    ivHex: string,
    encryptedHex: string,
  ): Promise<string> {
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const key = await this.deriveKey();
    const decipher = createDecipheriv('aes-256-cbc', key, iv);
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }
}
