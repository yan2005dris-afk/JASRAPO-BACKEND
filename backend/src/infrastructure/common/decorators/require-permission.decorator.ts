import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'permission';

export interface PermissionConfig {
  resource: string;
  action: string;
}

export const RequiredPermission = (resource: string, action: string) =>
  SetMetadata(PERMISSION_KEY, { resource, action });
