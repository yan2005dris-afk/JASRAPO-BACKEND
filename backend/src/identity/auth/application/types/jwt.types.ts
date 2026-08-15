import type { Request } from 'express';

export type JwtAccessPayload = {
  sub: number;
  sid: string;
  email?: string;
  tokenVersion?: number;
};

export type JwtRefreshPayload = {
  sub: number;
  sid: string;
  email?: string;
  tokenVersion?: number;
  sessionSecret?: string;
};

export type JwtPayload = {
  sub: number;
  usersId: number;
  sid: string;
  email?: string;
  permisos: { recurso: string; accion: string }[];
  rol?: string;
};

export type RequestWithCookies = Request & {
  cookies?: Record<string, unknown>;
};

export type JwtRequest = Request & {
  user: JwtPayload;
};