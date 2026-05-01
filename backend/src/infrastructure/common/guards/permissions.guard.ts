import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  PERMISSION_KEY,
  PermissionConfig,
} from '../decorators/require-permission.decorator';
import type {
  AuthPermission,
  AuthenticatedRequest,
} from '../types/auth-request.types';

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.get<PermissionConfig>(
      PERMISSION_KEY,
      context.getHandler(),
    );
    if (!required) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user || !user.usersId) {
      this.logger.error('Usuario no identificado en request.user');
      throw new ForbiddenException('Usuario no identificado');
    }

    // Permisos cargados por JwtStrategy — sin query extra a BD
    const permissions: AuthPermission[] = user.permissions ?? [];

    const hasPermission = permissions.some(
      (p) => p.resource === required.resource && p.action === required.action,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `${user.email} no tiene permiso para la acción "${required.action}" en "${required.resource}"`,
      );
    }

    return true;
  }
}
