export interface WebhookConfigRecord {
  id: string;
  nombre: string;
  url: string;
  eventos: string[];
  emisorId: number;
  secreto: string;
  activo: boolean;
  reintentosMax: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebhookLogRecord {
  id: string;
  configId: string;
  evento: string;
  payload: any;
  statusCode?: number | null;
  respuesta?: string | null;
  intento: number;
  exitoso: boolean;
  error?: string | null;
  tiempoRespuestaMs?: number | null;
  createdAt: Date;
}

export interface CreateWebhookInput {
  nombre: string;
  url: string;
  eventos: string[];
  emisorId: number;
  secreto: string;
  reintentosMax?: number;
}

export interface UpdateWebhookInput {
  nombre?: string;
  url?: string;
  eventos?: string[];
  activo?: boolean;
  reintentosMax?: number;
  secreto?: string;
}

export abstract class WebhookRepository {
  abstract findAll(emisorId?: number): Promise<WebhookConfigRecord[]>;
  abstract findById(id: string): Promise<WebhookConfigRecord | null>;
  abstract findActiveByEvent(
    evento: string,
    emisorId?: number,
  ): Promise<WebhookConfigRecord[]>;
  abstract create(data: CreateWebhookInput): Promise<WebhookConfigRecord>;
  abstract update(
    id: string,
    data: UpdateWebhookInput,
  ): Promise<WebhookConfigRecord>;
  abstract findLogs(
    configId: string,
    limit: number,
    offset: number,
  ): Promise<[number, WebhookLogRecord[]]>;
}
