import { Injectable } from '@nestjs/common';
import { Counter, Gauge, Histogram, Registry } from 'prom-client';

@Injectable()
export class MetricsService {
  private registry: Registry;

  // HTTP Metrics
  public httpRequestsTotal: Counter<string>;
  public httpRequestDuration: Histogram<string>;
  public httpRequestsInProgress: Gauge<string>;

  // Business Metrics
  public authLoginTotal: Counter<string>;
  public authLoginFailed: Counter<string>;
  public databaseQueryDuration: Histogram<string>;

  // Application Metrics
  public activeConnections: Gauge<string>;
  public errorTotal: Counter<string>;

  constructor() {
    this.registry = new Registry();
    this.initMetrics();
  }

  private initMetrics(): void {
    // HTTP Requests Total
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'status', 'route'],
      registers: [this.registry],
    });

    // HTTP Request Duration
    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
      registers: [this.registry],
    });

    // HTTP Requests In Progress
    this.httpRequestsInProgress = new Gauge({
      name: 'http_requests_in_progress',
      help: 'Number of HTTP requests currently being processed',
      labelNames: ['method', 'route'],
      registers: [this.registry],
    });

    // Auth Login Total
    this.authLoginTotal = new Counter({
      name: 'auth_login_total',
      help: 'Total number of successful login attempts',
      labelNames: ['method'],
      registers: [this.registry],
    });

    // Auth Login Failed
    this.authLoginFailed = new Counter({
      name: 'auth_login_failed_total',
      help: 'Total number of failed login attempts',
      labelNames: ['reason'],
      registers: [this.registry],
    });

    // Database Query Duration
    this.databaseQueryDuration = new Histogram({
      name: 'database_query_duration_seconds',
      help: 'Duration of database queries in seconds',
      labelNames: ['operation', 'table'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
      registers: [this.registry],
    });

    // Active Connections
    this.activeConnections = new Gauge({
      name: 'active_connections',
      help: 'Number of active connections',
      labelNames: ['type'],
      registers: [this.registry],
    });

    // Error Total
    this.errorTotal = new Counter({
      name: 'error_total',
      help: 'Total number of errors',
      labelNames: ['type', 'code'],
      registers: [this.registry],
    });

    // Add default metrics
    this.registry.setDefaultLabels({
      app: 'jasrapo-backend',
    });
  }

  getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  getRegistry(): Registry {
    return this.registry;
  }

  // Helper methods for common operations
  incrementHttpRequest(method: string, status: string, route: string): void {
    this.httpRequestsTotal.inc({ method, status, route });
  }

  observeHttpDuration(
    method: string,
    route: string,
    durationSeconds: number,
  ): void {
    this.httpRequestDuration.observe({ method, route }, durationSeconds);
  }

  incrementHttpInProgress(method: string, route: string): void {
    this.httpRequestsInProgress.inc({ method, route });
  }

  decrementHttpInProgress(method: string, route: string): void {
    this.httpRequestsInProgress.dec({ method, route });
  }

  incrementAuthLogin(method: string): void {
    this.authLoginTotal.inc({ method });
  }

  incrementAuthLoginFailed(reason: string): void {
    this.authLoginFailed.inc({ reason });
  }

  observeDatabaseQuery(
    operation: string,
    table: string,
    durationSeconds: number,
  ): void {
    this.databaseQueryDuration.observe({ operation, table }, durationSeconds);
  }

  setActiveConnections(type: string, count: number): void {
    this.activeConnections.set({ type }, count);
  }

  incrementError(type: string, code: string): void {
    this.errorTotal.inc({ type, code });
  }
}
