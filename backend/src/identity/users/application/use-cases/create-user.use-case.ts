import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Prisma } from 'src/generated/prisma/client';
import { CreateUserDto } from '../../interfaces/dto/create-user.dto';
import { ValidationUtil } from 'src/infrastructure/common/utils/validation.util';
import { PhoneUtil } from 'src/infrastructure/common/utils/phone.util';
import { UserRepository } from '../../domain/repositories/user.repository';

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(createUsersDto: CreateUserDto) {
    // Validar campos obligatorios
    ValidationUtil.requireNonEmpty(createUsersDto.email, 'email');
    ValidationUtil.requireNonEmpty(createUsersDto.nombres, 'nombres');
    ValidationUtil.requireNonEmpty(createUsersDto.apellidos, 'apellidos');
    ValidationUtil.requireNonEmpty(createUsersDto.telefono, 'telefono');

    const cleanPhone = PhoneUtil.validateAndClean(
      createUsersDto.telefono,
      'telefono',
    );

    // Verificar que el email no exista previamente (incluye usuarios eliminados)
    const existingUser = await this.userRepository.findUnique(
      { email: createUsersDto.email },
      { usuarioId: true, deletedAt: true },
    );
    if (existingUser) {
      if (existingUser.deletedAt) {
        throw new ConflictException(
          'El correo electrónico pertenece a un usuario eliminado. Contacte al administrador para restaurar el usuario.',
        );
      }
      throw new ConflictException('El correo electrónico ya está en uso');
    }

    // Determinar el rol a asignar
    let roleId: number;
    let roleName: string;

    if (createUsersDto.rolId) {
      const role = await this.userRepository.findRoleById(createUsersDto.rolId);
      if (!role || role.deletedAt) {
        throw new NotFoundException('Rol no encontrado o eliminado');
      }
      roleId = role.rolId;
      roleName = role.nombre;
    } else {
      const defaultRole = await this.userRepository.findRoleByName('user');
      if (!defaultRole) {
        throw new Error('No existe el rol por defecto "user".');
      }
      roleId = defaultRole.rolId;
      roleName = defaultRole.nombre;
    }

    // TODO: Generar contraseña temporal y enviar por email
    // Por ahora se crea con un hash placeholder
    const temporaryPassword = 'TEMP_' + Date.now();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    try {
      const newUser = await this.userRepository.create({
        email: createUsersDto.email,
        clave: hashedPassword,
        nombres: createUsersDto.nombres,
        apellidos: createUsersDto.apellidos,
        telefono: cleanPhone,
        avatar: createUsersDto.avatar,
        rolId: roleId,
        createdAt: new Date(),
      });

      return {
        usuarioId: newUser.usuarioId,
        email: newUser.email,
        nombres: newUser.nombres,
        apellidos: newUser.apellidos,
        telefono: newUser.telefono,
        avatar: newUser.avatar,
        rol: {
          rolId: roleId,
          nombre: roleName,
        },
      };
    } catch (error) {
      // Manejar error de constraint único de Prisma
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('El correo electrónico ya está en uso');
      }
      throw error;
    }
  }
}
