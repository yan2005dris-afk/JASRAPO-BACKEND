import type { Request } from 'express';

export type AuthPermission = {
  resource: string;
  action: string;
};

export type AuthUser = {
  usersId: number;
  email?: string;
  permissions?: AuthPermission[];
};

export type AuthenticatedRequest = Request & {
  user?: AuthUser;
};
