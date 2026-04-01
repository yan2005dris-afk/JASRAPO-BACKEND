import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  constructor(private readonly configService: ConfigService) {
    const adapter = new PrismaPg({
      connectionString: configService.getOrThrow<string>('DATABASE_URL'),
    });
    super({ adapter });
  }
  
  async onModuleInit() {
    try {
      await this.$connect(); // Falla rápido si la DB no está disponible
      this.logger.log(
        '[POSTGRES:UP] Conexion a PostgreSQL establecida correctamente',
      );
    } catch (error) {
      const trace = error instanceof Error ? error.stack : String(error);
      this.logger.error(
        '[POSTGRES:DOWN] No se pudo conectar a PostgreSQL',
        trace,
      );
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect(); // Limpia conexiones al cerrar
    this.logger.log('[POSTGRES:DOWN] Conexion a PostgreSQL cerrada');
  }

  // Extensión para implementar "soft deletes" en la tabla lecturas
  get extendedClient() {
    return this.$extends({
      query: {
        lecturas: { 
          // Cuando alguien intente un .delete(), lo flitramos para que en vez de eliminar el registro, le pongamos una fecha en deletedAt
          //El registro nunca se elimina
          async delete({ args }) {
            return (this as any).update({
              ...args,
              data: { deletedAt: new Date() },
            });
          },

          // Lo mismo de arriba pero por si tiran un delete masivo
          async deleteMany({ args }) {
            return (this as any).updateMany({
              ...args,
              data: { deletedAt: new Date() },
            });
          },
          // Cuando hagan un .findMany(), usamos el filtro deletedAt: null 
          // Así, los registros "eliminados" no aparecerán en las consultas normales
          async findMany({ args, query }) {
            args.where = { ...args.where, deletedAt: null };
            return query(args);
          },

          // Lo mismo si buscan solo el primero
          async findFirst({ args, query }) {
            args.where = { ...args.where, deletedAt: null };
            return query(args);
          },

          // Y si buscan por ID, también filtramos para que no encuentren registros "eliminados"
          async findUnique({ args, query }) {
            args.where = { ...args.where, deletedAt: null };
            return query(args);
          },
        },
      },
    });
  }
}
