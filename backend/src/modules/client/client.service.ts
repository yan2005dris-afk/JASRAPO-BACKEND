import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { TipoIdentificacion } from 'src/generated/prisma/enums';
import { TipoIdentificacionUtil } from 'src/common/util/tipo-identificacion.util';
import { Prisma } from 'src/generated/prisma/client';

@Injectable()
export class ClientService {
  constructor(private prisma: PrismaService) {}

  // =========================
  // NORMALIZACIÓN
  // =========================
  private normalizar(text?: string | null): string | undefined {
    if (text === null || text === undefined) return undefined;
    return text.trim().toUpperCase();
  }

  private normalizarEmail(email?: string | null): string | undefined {
    if (email === null || email === undefined) return undefined;
    return email.trim().toLowerCase();
  }

  private normalizarIdentificacion(identificacion?: string): string {
    if (!identificacion) {
      throw new BadRequestException('Identificación requerida');
    }
    return identificacion.trim();
  }

  private parseId(id: string): bigint {
    if (!id || isNaN(Number(id))) {
      throw new BadRequestException('ID inválido');
    }
    return BigInt(id);
  }

  // =========================
  // VALIDACIONES
  // =========================
  private validarIdentificacion(
    tipo: TipoIdentificacion,
    identificacion: string,
  ) {
    if (!tipo) {
      throw new BadRequestException('Tipo de identificación requerido');
    }

    if (
      tipo !== TipoIdentificacion.CONSUMIDOR_FINAL &&
      !TipoIdentificacionUtil.validar(tipo, identificacion)
    ) {
      throw new BadRequestException('Identificación inválida');
    }
  }

  private validarCamposBasicos(
    tipo: TipoIdentificacion,
    nombres?: string,
    apellidos?: string,
  ) {
    if (
      tipo !== TipoIdentificacion.CONSUMIDOR_FINAL &&
      (!nombres || !apellidos)
    ) {
      throw new BadRequestException(
        'Nombres y apellidos son requeridos',
      );
    }
  }

  // =========================
  // HELPERS DB
  // =========================
  private async findByIdentificacion(identificacion: string) {
    return this.prisma.clientes.findUnique({
      where: { identificacion },
    });
  }

  private async ensureNotActive(cliente: any) {
    if (cliente && cliente.deletedAt === null) {
      throw new ConflictException('La identificación ya está registrada');
    }
  }

  private async reactivateCliente(
    clienteId: bigint,
    data: Prisma.ClientesUpdateInput,
  ) {
    return this.prisma.clientes.update({
      where: { clienteId },
      data: {
        ...data,
        deletedAt: null,
      },
    });
  }

  // =========================
  // BUILD DATA
  // =========================
  private buildCreateData(
    dto: CreateClientDto,
    identificacion: string,
  ): Prisma.ClientesCreateInput {
    return {
      identificacion,
      tipoIdentificacion: dto.tipoIdentificacion,
      nombres: this.normalizar(dto.nombres)!,
      apellidos: this.normalizar(dto.apellidos)!,
      razonSocial: this.normalizar(dto.razonSocial),
      email: this.normalizarEmail(dto.email),
      telefono: dto.telefono,
      telefonoSecundario: dto.telefonoSecundario,
      direccionDomicilio: dto.direccionDomicilio,
      aplicaTerceraEdadDiscapacidad:
        dto.aplicaTerceraEdadDiscapacidad ?? false,
    };
  }

  // =========================
  // CONSUMIDOR FINAL
  // =========================
  private async handleConsumidorFinal(dto: CreateClientDto) {
    const consumidores = await this.prisma.clientes.findMany({
      where: {
        tipoIdentificacion: TipoIdentificacion.CONSUMIDOR_FINAL,
      },
      orderBy: { createdAt: 'asc' },
    });

    const principal = consumidores[0];

    // Si ya existe → reutilizar y avisar
    if (principal) {
      if (consumidores.length > 1) {
        const duplicados = consumidores.slice(1);

        await this.prisma.clientes.updateMany({
          where: {
            clienteId: { in: duplicados.map(c => c.clienteId) },
          },
          data: { deletedAt: new Date() },
        });
      }

      const updated = await this.reactivateCliente(principal.clienteId, {
        identificacion: '9999999999999',
        nombres: 'CONSUMIDOR',
        apellidos: 'FINAL',
        razonSocial: 'CONSUMIDOR FINAL',
        email: this.normalizarEmail(dto.email),
        telefono: dto.telefono,
        telefonoSecundario: dto.telefonoSecundario,
        direccionDomicilio: dto.direccionDomicilio,
      });

      return {
        message: 'Ya existe un Consumidor Final. Se reutilizó el registro existente.',
        data: updated,
      };
    }

    // Crear nuevo
    const created = await this.prisma.clientes.create({
      data: {
        identificacion: '9999999999999',
        tipoIdentificacion: TipoIdentificacion.CONSUMIDOR_FINAL,
        nombres: 'CONSUMIDOR',
        apellidos: 'FINAL',
        razonSocial: 'CONSUMIDOR FINAL',
        email: this.normalizarEmail(dto.email),
        telefono: dto.telefono,
        telefonoSecundario: dto.telefonoSecundario,
        direccionDomicilio: dto.direccionDomicilio,
        aplicaTerceraEdadDiscapacidad: false,
      },
    });

    return {
      message: 'Consumidor Final creado correctamente.',
      data: created,
    };
  }

  // =========================
  // CREATE
  // =========================
  async create(dto: CreateClientDto) {
    // PRIMERO validar si es consumidor final
    if (dto.tipoIdentificacion === TipoIdentificacion.CONSUMIDOR_FINAL) {
      return this.handleConsumidorFinal(dto);
    }

    // SOLO para los demás casos
    const identificacion = this.normalizarIdentificacion(dto.identificacion);

    this.validarIdentificacion(dto.tipoIdentificacion, identificacion);
    this.validarCamposBasicos(
      dto.tipoIdentificacion,
      dto.nombres,
      dto.apellidos,
    );

    const existente = await this.findByIdentificacion(identificacion);

    const data = this.buildCreateData(dto, identificacion);

    if (existente && existente.deletedAt !== null) {
      return this.reactivateCliente(existente.clienteId, data);
    }

    await this.ensureNotActive(existente);

    try {
      return await this.prisma.clientes.create({ data });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('La identificación ya está registrada');
      }
      throw error;
    }
  }

  // =========================
  // FIND ALL
  // =========================
  async findAll() {
    return this.prisma.clientes.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  // =========================
  // FIND ONE
  // =========================
  async findOne(id: string) {
    const clienteId = this.parseId(id);

    const cliente = await this.prisma.clientes.findFirst({
      where: {
        clienteId,
        deletedAt: null,
      },
    });

    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }

    return cliente;
  }

  // =========================
  // UPDATE
  // =========================
  async update(id: string, dto: UpdateClientDto) {
    const clienteId = this.parseId(id);
    const cliente = await this.findOne(id);

    const tipoFinal = dto.tipoIdentificacion ?? cliente.tipoIdentificacion;
    const identificacionFinal = this.normalizarIdentificacion(
      dto.identificacion ?? cliente.identificacion,
    );

    this.validarIdentificacion(tipoFinal, identificacionFinal);

    // Validar duplicado
    if (dto.identificacion) {
      const existente = await this.findByIdentificacion(identificacionFinal);

      if (existente && existente.clienteId !== clienteId) {
        throw new ConflictException(
          'La identificación ya está registrada',
        );
      }
    }

    this.validarCamposBasicos(
      tipoFinal,
      dto.nombres ?? cliente.nombres,
      dto.apellidos ?? cliente.apellidos,
    );

    return this.prisma.clientes.update({
      where: { clienteId },
      data: {
        tipoIdentificacion: tipoFinal,
        identificacion: identificacionFinal,
        nombres: this.normalizar(dto.nombres ?? cliente.nombres)!,
        apellidos: this.normalizar(dto.apellidos ?? cliente.apellidos)!,
        razonSocial: this.normalizar(dto.razonSocial),
        email: this.normalizarEmail(dto.email),
        telefono: dto.telefono ?? cliente.telefono,
        telefonoSecundario:
          dto.telefonoSecundario ?? cliente.telefonoSecundario,
        direccionDomicilio:
          dto.direccionDomicilio ?? cliente.direccionDomicilio,
        aplicaTerceraEdadDiscapacidad:
          dto.aplicaTerceraEdadDiscapacidad ??
          cliente.aplicaTerceraEdadDiscapacidad,
      },
    });
  }

  // =========================
  // REMOVE (SOFT DELETE)
  // =========================
  async remove(id: string) {
    const clienteId = this.parseId(id);

    const cliente = await this.findOne(id);

    return this.prisma.clientes.update({
      where: { clienteId },
      data: { deletedAt: new Date() },
    });
  }

  private normalizarBusqueda(valor: string): string[] {
    return valor
      .trim()
      .toUpperCase()
      .replace(/\s+/g, ' ')
      .split(' ')
      .filter(Boolean);
  }

  // =========================
  // SEARCH
  // =========================
  async searchPrivate(
    tipo: 'identificacion' | 'nombreCompleto',
    valor: string,
    page = 1,
    limit = 10,
  ) {
    if (!tipo || !valor) {
      throw new BadRequestException('Debe enviar tipo y valor');
    }

    const skip = (page - 1) * limit;

    let results;

    switch (tipo) {
      case 'identificacion': {
        results = await this.prisma.clientes.findMany({
          where: {
            identificacion: this.normalizarIdentificacion(valor),
            deletedAt: null,
          },
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc',
          },
        });
        break;
      }

      case 'nombreCompleto': {
        const tokens = this.normalizarBusqueda(valor);

        results = await this.prisma.clientes.findMany({
          where: {
            AND: tokens.map((t) => ({
              OR: [
                {
                  nombres: {
                    contains: t,
                    mode: 'insensitive',
                  },
                },
                {
                  apellidos: {
                    contains: t,
                    mode: 'insensitive',
                  },
                },
              ],
            })),
            deletedAt: null,
          },
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc',
          },
        });

        break;
      }

      default:
        throw new BadRequestException('Tipo inválido');
    }

    if (!results.length) {
      throw new NotFoundException('Cliente no encontrado');
    }

    return results;
  }
}
