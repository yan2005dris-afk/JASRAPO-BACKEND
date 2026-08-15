import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserEntity } from '../../domain/entities/user.entity';

@Injectable()
export class GetUserProfileUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(usersId: number): Promise<UserEntity> {
    const user = await this.userRepository.findById(usersId);

    if (!user || user.deletedAt) {
      throw new NotFoundException('Usuario no encontrado o eliminado');
    }

    const fullName = [user.nombres, user.apellidos].filter(Boolean).join(' ');

    return {
      usuarioId: user.usuarioId,
      email: user.email,
      nombre: fullName || null,
      telefono: user.telefono,
      avatar: user.avatar,
      rol:
        user.rol && !user.rol.deletedAt
          ? { rolId: user.rol.rolId, nombre: user.rol.nombre }
          : null,
    } as any;
  }
}
