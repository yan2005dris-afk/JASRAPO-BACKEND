export interface JwtRequest extends Request {
  user: {
    sub: number;
  };
}
