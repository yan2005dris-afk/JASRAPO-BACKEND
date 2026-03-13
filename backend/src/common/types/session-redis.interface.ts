export interface SessionRedis {
  sessionsId: number;
  usersId: number;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  isRevoked: boolean;
  refreshToken: string;
  createdAt: number;
  expiresAt: number;
  [key: string]: unknown;
}
