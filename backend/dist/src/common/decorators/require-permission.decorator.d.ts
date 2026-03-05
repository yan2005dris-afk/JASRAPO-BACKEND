export declare const PERMISSION_KEY = "permission";
export interface PermissionConfig {
    resource: string;
    action: string;
}
export declare const RequiredPermission: (resource: string, action: string) => import("@nestjs/common").CustomDecorator<string>;
