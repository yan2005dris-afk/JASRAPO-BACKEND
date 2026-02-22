import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/database/prisma.service';
import {
  PERMISSION_KEY,
  PermissionConfig,
} from '../decorators/require-permission.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.get<PermissionConfig>(
      PERMISSION_KEY,
      context.getHandler(),
    );
    if (!required) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.usersId) {
      throw new ForbiddenException('Usuario no identificado');
    }

    const hasPermissions = await this.prisma.userRoles.findFirst({
      where: {
        usersId: user.usersId,
        roles: {
          rolPermissions: {
            some: {
              permissions: {
                resource: required.resource,
                action: required.action,
                deletedAt: null,
              },
            },
          },
        },
      },
    });
    if (!hasPermissions) {
      throw new ForbiddenException(
        `Usuario no tiene permisos la acción ${required.action} en  ${required.resource}`,
      );
    }
    return true;
  }
}
