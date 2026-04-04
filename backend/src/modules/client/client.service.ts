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

  // ============================
  // Normalización de datos
  // ============================
  private normalizar(text?: string): string | undefined {
    return text?.trim().toUpperCase();
  }

  private normalizarEmail(email?: string): string | undefined {
    return email?.trim().toLowerCase();
  }

  private parseId(id: string): bigint {
    if (!id || isNaN(Number(id))) {
      throw new BadRequestException('ID inválido');
    }
    return BigInt(id);
  }

  private getPagination(page = 1, limit = 10) {
    const safeLimit = Math.min(limit, 50);
    const safePage = page < 1 ? 1 : page;

    return {
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    };
  }
  // ============================
  // CREATE
  // ============================
  async create(createClientDto: CreateClientDto) {
    const {
      nombres,
      apellidos,
      identificacion,
      tipoIdentificacion,
      email,
      telefono,
      telefonoSecundario,
      aplicaTerceraEdadDiscapacidad,
      razonSocial,
      direccionDomicilio,
    } = createClientDto;

    if (!tipoIdentificacion) {
      throw new BadRequestException('Tipo de identificación requerido');
    }

    let dataFinal: Prisma.ClientesCreateInput;

    // CONSUMIDOR FINAL
    if (tipoIdentificacion === TipoIdentificacion.CONSUMIDOR_FINAL) {
      const existeCF = await this.prisma.clientes.findFirst({
        where: { tipoIdentificacion: TipoIdentificacion.CONSUMIDOR_FINAL },
      });

      if (existeCF) {
        throw new ConflictException('Ya existe un consumidor final registrado');
      }

      dataFinal = {
        identificacion: '9999999999999',
        tipoIdentificacion: 'CONSUMIDOR_FINAL',
        nombres: 'CONSUMIDOR',
        apellidos: 'FINAL',
        razonSocial: 'CONSUMIDOR FINAL',
        email: this.normalizarEmail(email),
        telefono,
        telefonoSecundario,
        direccionDomicilio,
        aplicaTerceraEdadDiscapacidad: false,
      };
    } else {
      // VALIDACIÓN SRI
      if (
        !identificacion ||
        !TipoIdentificacionUtil.validar(tipoIdentificacion, identificacion)
      ) {
        throw new BadRequestException('Identificación inválida o requerida');
      }

      dataFinal = {
        identificacion,
        tipoIdentificacion,
        nombres: this.normalizar(nombres)!,
        apellidos: this.normalizar(apellidos)!,
        razonSocial: this.normalizar(razonSocial),
        email: this.normalizarEmail(email),
        telefono,
        telefonoSecundario,
        direccionDomicilio,
        aplicaTerceraEdadDiscapacidad:
          aplicaTerceraEdadDiscapacidad ?? false,
      };
    }

    try {
      return await this.prisma.clientes.create({ data: dataFinal });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('La identificación ya está registrada');
      }
      throw error;
    }
  }

  // ============================
  // FIND ALL
  // ============================
  async findAll() {
    return this.prisma.clientes.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

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

  // ============================
  // UPDATE
  // ============================
  async update(id: string, updateClientDto: UpdateClientDto) {
    const clienteId = this.parseId(id);
    const cliente = await this.findOne(id);

    const {
      tipoIdentificacion,
      identificacion,
      nombres,
      apellidos,
      razonSocial,
      email,
      telefono,
      telefonoSecundario,
      direccionDomicilio,
      aplicaTerceraEdadDiscapacidad,
    } = updateClientDto;

    const tipoFinal = tipoIdentificacion ?? cliente.tipoIdentificacion;
    const identificacionFinal = identificacion ?? cliente.identificacion;

    if (!TipoIdentificacionUtil.validar(tipoFinal, identificacionFinal)) {
      throw new BadRequestException('Identificación inválida');
    }

    if (identificacion) {
      const existe = await this.prisma.clientes.findFirst({
        where: {
          identificacion,
          NOT: { clienteId },
        },
      });

      if (existe) {
        throw new ConflictException('La identificación ya está registrada');
      }
    }

    const nombresFinal = nombres ?? cliente.nombres;
    const apellidosFinal = apellidos ?? cliente.apellidos;

    if (
      tipoFinal !== TipoIdentificacion.CONSUMIDOR_FINAL &&
      (!nombresFinal || !apellidosFinal)
    ) {
      throw new BadRequestException(
        'Nombres y apellidos son requeridos para clientes que no son CONSUMIDOR_FINAL',
      );
    }

    return this.prisma.clientes.update({
      where: { clienteId },
      data: {
        ...(tipoIdentificacion && { tipoIdentificacion }),
        ...(identificacion && { identificacion }),
        nombres: this.normalizar(nombresFinal)!,
        apellidos: this.normalizar(apellidosFinal)!,
        ...(razonSocial && { razonSocial: this.normalizar(razonSocial) }),
        ...(email !== undefined && { email: this.normalizarEmail(email) }),
        ...(telefono !== undefined && { telefono }),
        ...(telefonoSecundario !== undefined && { telefonoSecundario }),
        ...(direccionDomicilio !== undefined && { direccionDomicilio }),
        ...(aplicaTerceraEdadDiscapacidad !== undefined && {
          aplicaTerceraEdadDiscapacidad,
        }),
      },
    });
  }

  async remove(id: string) {
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

    return this.prisma.clientes.update({
      where: { clienteId },
      data: { deletedAt: new Date() },
    });
  }

  async search(
    tipo: 'identificacion' | 'nombres' | 'apellidos' | 'nombreCompleto',
    valor: string,
    page = 1,
    limit = 10,
  ) {
    if (!tipo || !valor) {
      throw new BadRequestException('Debe enviar tipo y valor');
    }

    const { skip, take } = this.getPagination(page, limit);

    switch (tipo) {
      case 'identificacion':
        if (valor.length < 6) {
          throw new BadRequestException('Identificación inválida');
        }
        return this.prisma.clientes.findMany({
          where: { identificacion: valor, deletedAt: null },
          skip,
          take,
        });

      case 'nombres':
      case 'apellidos':
        return this.prisma.clientes.findMany({
          where: {
            [tipo]: { contains: valor, mode: 'insensitive' },
            deletedAt: null,
          },
          skip,
          take,
        });

      case 'nombreCompleto':
        return this.prisma.clientes.findMany({
          where: {
            OR: [
              { nombres: { contains: valor, mode: 'insensitive' } },
              { apellidos: { contains: valor, mode: 'insensitive' } },
            ],
            deletedAt: null,
          },
          skip,
          take,
        });

      default:
        throw new BadRequestException('Tipo inválido');
    }
  }

  async searchPrivate(
    tipo: 'identificacion' | 'nombreCompleto',
    valor: string,
    page = 1,
    limit = 10,
  ) {
    if (!tipo || !valor) {
      throw new BadRequestException('Debe enviar tipo y valor');
    }

    const { skip, take } = this.getPagination(page, limit);

    let results;

    switch (tipo) {
      case 'identificacion':
        if (valor.length < 6) {
          throw new BadRequestException('Identificación inválida');
        }

        results = await this.prisma.clientes.findMany({
          where: {
            identificacion: valor,
            deletedAt: null,
          },
          skip,
          take,
        });
        break;

      case 'nombreCompleto':
        results = await this.prisma.clientes.findMany({
          where: {
            OR: [
              { nombres: { contains: valor, mode: 'insensitive' } },
              { apellidos: { contains: valor, mode: 'insensitive' } },
            ],
            deletedAt: null,
          },
          skip,
          take,
        });
        break;

      default:
        throw new BadRequestException('Tipo inválido');
    }

    if (!results.length) {
      throw new NotFoundException('Cliente no encontrado');
    }

    return results;
  }
}
