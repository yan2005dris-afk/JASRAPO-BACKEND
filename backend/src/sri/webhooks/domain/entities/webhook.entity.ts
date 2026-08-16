export class WebhookEntity {
  id: number;
  url: string;
  secretKey?: string | null;
  eventos: string[];
  activo: boolean;
  descripcion?: string | null;
  ultimoEnvio?: Date | null;
  ultimoEstado?: number | null;
  ultimoError?: string | null;
  fallosConsecutivos: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<WebhookEntity>) {
    Object.assign(this, partial);
  }

  isHealthy(): boolean {
    return this.activo && this.fallosConsecutivos < 5;
  }
}
