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

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.get<PermissionConfig>(
      PERMISSION_KEY,
      context.getHandler(),
    );
    if (!required) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.permissions) {
      throw new ForbiddenException('Usuario no identificado o sin permisos');
    }

    const hasPermission = user.permissions.some(
      (p) => p.resource === required.resource && p.action === required.action,
    );
    if (!hasPermission) {
      throw new ForbiddenException(
        `Tu Usuario no tiene permisos la acción ${required.action} en  ${required.resource}`,
      );
    }
    return true;
  }
}
