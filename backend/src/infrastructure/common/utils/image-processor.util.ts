import sharp from 'sharp';

/**
 * Utilidad para el procesamiento de imágenes usando Sharp.
 */
export class ImageProcessorUtil {
  /**
   * Procesa una imagen de perfil:
   * - Redimensiona a un máximo de 512x512px (manteniendo el aspect ratio).
   * - Convierte a formato WebP.
   * - Aplica una compresión de calidad.
   *
   * @param buffer Buffer de la imagen original.
   * @param options Opciones de personalización.
   * @returns Buffer de la imagen procesada en formato WebP.
   */
  static async processProfilePicture(
    buffer: Buffer,
    options: { size?: number; quality?: number } = {},
  ): Promise<Buffer> {
    const { size = 512, quality = 80 } = options;

    if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
      throw new Error('No se proporcionó un buffer de imagen válido');
    }

    try {
      // Validación temprana: intentar leer metadata
      await sharp(buffer).metadata();

      return await sharp(buffer)
        .resize(size, size, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality })
        .toBuffer();
    } catch (error) {
      throw new Error(
        `Error al procesar la imagen de perfil (size: ${size}, quality: ${quality}): ${error.message}`,
      );
    }
  }

  /**
   * Procesa una imagen genérica a WebP con redimensionamiento opcional.
   */
  static async toWebP(
    buffer: Buffer,
    options: { width?: number; height?: number; quality?: number } = {},
  ): Promise<Buffer> {
    const { width, height, quality = 80 } = options;

    if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
      throw new Error('No se proporcionó un buffer de imagen válido');
    }

    try {
      // Validación temprana: intentar leer metadata
      await sharp(buffer).metadata();

      let pipeline = sharp(buffer);

      if (width || height) {
        pipeline = pipeline.resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      return await pipeline.webp({ quality }).toBuffer();
    } catch (error) {
      throw new Error(
        `Error al convertir imagen a WebP (w: ${width}, h: ${height}, q: ${quality}): ${error.message}`,
      );
    }
  }
}
