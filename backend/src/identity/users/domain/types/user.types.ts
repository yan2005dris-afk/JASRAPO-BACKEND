import type { AuthPermissionEntity } from '../entities/user.entity';

export interface EffectivePermissionsResponse {
  usuarioId: number;
  permisos: AuthPermissionEntity[];
}
