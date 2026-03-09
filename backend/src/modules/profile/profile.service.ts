import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from 'src/database/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { MinioService } from '../storage/minio.service';

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private minioService: MinioService,
  ) { }

  /**
   * Crea el perfil del usuario autenticado.
   * Lanza ConflictException si ya existe un perfil para ese usuario.
   */
  async create(usersId: number, createProfileDto: CreateProfileDto) {
    const existing = await this.prisma.profiles.findUnique({
      where: { usersId },
    });

    if (existing) {
      throw new ConflictException('El usuario ya tiene un perfil creado');
    }

    const profile = await this.prisma.profiles.create({
      data: {
        usersId,
        firstName: createProfileDto.firstName,
        lastName: createProfileDto.lastName,
        phone: createProfileDto.phone,
      },
    });

    return profile;
  }

  /**
   * Retorna el perfil del usuario autenticado.
   * Si no existe, lo crea vacío automáticamente.
   * Si avatar es null en BD pero hay imágenes en MinIO, recupera la más reciente.
   */
  async findMyProfile(usersId: number) {
    let profile = await this.prisma.profiles.findUnique({
      where: { usersId },
    });
    if (!profile) {
      profile = await this.prisma.profiles.create({
        data: { usersId },
      });
    }
    return profile;
  }
  
  /**
   * Actualiza el perfil del usuario autenticado.
   * Si no existe, lo crea con los datos proporcionados.
   */
  async update(usersId: number, updateProfileDto: UpdateProfileDto) {
    const existing = await this.prisma.profiles.findUnique({
      where: { usersId },
    });

    if (!existing) {
      return this.prisma.profiles.create({
        data: {
          usersId,
          firstName: updateProfileDto.firstName,
          lastName: updateProfileDto.lastName,
          phone: updateProfileDto.phone,
        },
      });
    }

    return this.prisma.profiles.update({
      where: { usersId },
      data: {
        firstName: updateProfileDto.firstName,
        lastName: updateProfileDto.lastName,
        phone: updateProfileDto.phone,
      },
    });
  }

  /**
   * Sube una foto de perfil a MinIO y guarda la clave en el perfil del usuario.
   * Si no existe perfil, lo crea automáticamente.
   */
  async uploadAvatar(usersId: number, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se envió ninguna imagen');
    }

    // Auto-crear perfil si no existe
    let profile = await this.prisma.profiles.findUnique({
      where: { usersId },
    });

    if (!profile) {
      profile = await this.prisma.profiles.create({
        data: { usersId },
      });
    }

    // Generar nombre de archivo con UUID
    const uuid = randomUUID();
    const fileExtension = file.originalname.split('.').pop() || 'png';
    const fileName = `${uuid}.${fileExtension}`;
    const bucketName = 'avatars';

    // Subir el archivo a MinIO
    await this.minioService.uploadFile(bucketName, fileName, file.buffer);

    // Crear metadata JSON
    const avatarMeta = {
      uuid,
      key: fileName,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      bucket: bucketName,
      uploadedAt: new Date().toISOString(),
    };

    // Actualizar el avatar del usuario con metadata JSON
    await this.prisma.profiles.update({
      where: { usersId },
      data: { avatar: avatarMeta },
    });

    return {
      message: 'Foto de perfil actualizada exitosamente',
      avatar: avatarMeta,
    };
  }

  /**
   * Lista los avatares disponibles en MinIO para el usuario.
   * Busca archivos con el patrón avatar_profile_{usersId}_ y también UUIDs vinculados.
   */
  async listAvailableAvatars(usersId: number) {
    const allFiles = await this.minioService.listFiles('avatars');

    // Filtrar archivos de este usuario (formato viejo) + obtener presigned URLs
    const userFiles = allFiles.filter(f =>
      f.startsWith(`avatar_profile_${usersId}_`),
    );

    // También incluir el avatar actual si existe y no está en la lista
    const profile = await this.prisma.profiles.findUnique({
      where: { usersId },
    });
    const currentMeta = profile?.avatar as Record<string, any> | null;
    if (currentMeta?.key && !userFiles.includes(currentMeta.key)) {
      userFiles.push(currentMeta.key);
    }

    const avatars = await Promise.all(
      userFiles.map(async (key) => {
        const url = await this.minioService.getPresignedUrl('avatars', key);
        return { key, url };
      }),
    );

    return { avatars };
  }

  /**
   * Vincula un archivo de avatar existente en MinIO al perfil del usuario.
   * No necesita re-subir el archivo, solo actualiza la referencia en BD.
   */
  async selectExistingAvatar(usersId: number, key: string) {
    if (!key) {
      throw new BadRequestException('Debe indicar el key del archivo');
    }

    const exists = await this.minioService.fileExists('avatars', key);
    if (!exists) {
      throw new NotFoundException(
        'Imagen no encontrada en el almacenamiento. Es posible que haya sido eliminada.',
      );
    }

    const meta = await this.minioService.getFileMetadata('avatars', key);

    const avatarMeta = {
      uuid: key.split('.')[0],
      key,
      originalName: key,
      mimeType: meta?.contentType || 'image/png',
      size: meta?.size || 0,
      bucket: 'avatars',
      uploadedAt: meta?.lastModified?.toISOString() || new Date().toISOString(),
    };

    // Auto-crear perfil si no existe
    let profile = await this.prisma.profiles.findUnique({
      where: { usersId },
    });

    if (!profile) {
      profile = await this.prisma.profiles.create({
        data: { usersId, avatar: avatarMeta },
      });
    } else {
      profile = await this.prisma.profiles.update({
        where: { usersId },
        data: { avatar: avatarMeta },
      });
    }

    return {
      message: 'Avatar vinculado exitosamente',
      avatar: avatarMeta,
    };
  }
}
