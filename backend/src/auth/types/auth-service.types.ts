export type DecodedJwt = {
  iat?: number;
  exp?: number;
};

export type SessionBase = {
  usersId: number;
  sessionsId: number;
  email?: string;
  createdAt?: number;
  expiresAt?: number;
};
