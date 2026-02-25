import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  PERMISSION_KEY,
  PermissionConfig,
} from '../decorators/require-permission.decorator';
import { UserService } from 'src/models/user/user.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userService: UserService,
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

    // Obtener permisos efectivos
    const effectivePermissions = await this.userService.getEffectivePermissions(
      user.usersId,
    );

    const hasPermission = effectivePermissions.some(
      (p) => p.resource === required.resource && p.action === required.action,
    );
    if (!hasPermission) {
      throw new ForbiddenException(
        `${request.user.email} no tiene permisos la acción ${required.action} en ${required.resource}`,
      );
    }
    return true;
  }
}
