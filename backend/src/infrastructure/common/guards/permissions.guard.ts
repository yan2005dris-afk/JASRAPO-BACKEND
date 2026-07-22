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
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import type {
  AuthPermission,
  AuthenticatedRequest,
} from '../types/auth-request.types';

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    let required = this.reflector.get<PermissionConfig>(
      PERMISSION_KEY,
      context.getHandler(),
    );

    if (!required) {
      required = this.reflector.get<PermissionConfig>(
        PERMISSION_KEY,
        context.getClass(),
      );
    }

    if (!required) {
      this.logger.error(
        `Missing @RequiredPermission decorator on ${context.getClass().name}.${context.getHandler().name}`,
      );
      throw new ForbiddenException(
        'Missing @RequiredPermission decorator on protected route',
      );
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user || !user.usersId) {
      this.logger.error('Usuario no identificado en request.user');
      throw new ForbiddenException('Usuario no identificado');
    }

    const permissions: AuthPermission[] = Array.isArray(user.permisos)
      ? user.permisos
      : [];

    const hasPermission = permissions.some(
      (p) => p.recurso === required.recurso && p.accion === required.accion,
    );

    if (!hasPermission) {
      this.logger.warn(
        `Acceso denegado: Usuario ${user.email} intentó ${required.accion} en ${required.recurso}`,
      );
      throw new ForbiddenException(
        `No tienes permiso para la acción "${required.accion}" en "${required.recurso}"`,
      );
    }

    return true;
  }
}
