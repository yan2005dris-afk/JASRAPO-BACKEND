export abstract class SessionRepository {
  abstract create(data: any): Promise<any>;
  abstract findById(sesionId: string): Promise<any>;
  abstract findActiveSession(usuarioId: number, sesionId: string): Promise<any>;
  abstract findActiveSessionsByUser(usuarioId: number): Promise<any[]>;
  abstract update(sesionId: string, data: any): Promise<any>;
  abstract revoke(sesionId: string): Promise<any>;
}
