import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { CreateClientDto } from '../dto/create-client.dto';
import { TipoIdentificacion } from 'src/generated/prisma/enums';
import { TipoIdentificacionUtil } from 'src/infrastructure/common/util/tipo-identificacion.util';
import { Prisma } from 'src/generated/prisma/client';

@Injectable()
export class CreateCustomerUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateClientDto) {
    if (dto.tipoIdentificacion === TipoIdentificacion.CONSUMIDOR_FINAL) {
      return this.handleConsumidorFinal(dto);
    }

    if (!dto.identificacion) {
      throw new BadRequestException(
        'La identificación es requerida para este tipo de cliente',
      );
    }

    const identificacion = dto.identificacion.trim();
    this.validarIdentificacion(dto.tipoIdentificacion, identificacion);
    this.validarCamposBasicos(
      dto.tipoIdentificacion,
      dto.nombres,
      dto.apellidos,
    );

    const existente = await this.prisma.clientes.findUnique({
      where: { identificacion },
    });

    const data = this.buildCreateData(dto, identificacion);

    if (existente) {
      if (existente.deletedAt !== null) {
        return this.prisma.clientes.update({
          where: { clienteId: existente.clienteId },
          data: { ...data, deletedAt: null },
        });
      }
      throw new ConflictException('La identificación ya está registrada');
    }

    try {
      return await this.prisma.clientes.create({ data });
    } catch (error: any) {
      if (error.code === 'P2002')
        throw new ConflictException('La identificación ya está registrada');
      throw error;
    }
  }

  private async handleConsumidorFinal(dto: CreateClientDto) {
    const consumidores = await this.prisma.clientes.findMany({
      where: { tipoIdentificacion: TipoIdentificacion.CONSUMIDOR_FINAL },
      orderBy: { createdAt: 'asc' },
    });

    const principal = consumidores[0];

    if (principal) {
      if (consumidores.length > 1) {
        const duplicados = consumidores.slice(1);
        await this.prisma.clientes.updateMany({
          where: { clienteId: { in: duplicados.map((c) => c.clienteId) } },
          data: { deletedAt: new Date() },
        });
      }

      const updated = await this.prisma.clientes.update({
        where: { clienteId: principal.clienteId },
        data: {
          identificacion: '9999999999999',
          nombres: 'CONSUMIDOR',
          apellidos: 'FINAL',
          razonSocial: 'CONSUMIDOR FINAL',
          email: dto.email?.trim().toLowerCase(),
          telefono: dto.telefono,
          telefonoSecundario: dto.telefonoSecundario,
          direccionDomicilio: dto.direccionDomicilio,
          aplicaTerceraEdad: false,
          aplicaDiscapacidad: false,
          deletedAt: null,
        },
      });

      return {
        message: 'Consumidor Final reactivado correctamente.',
        data: updated,
      };
    }

    const created = await this.prisma.clientes.create({
      data: {
        identificacion: '9999999999999',
        tipoIdentificacion: TipoIdentificacion.CONSUMIDOR_FINAL,
        nombres: 'CONSUMIDOR',
        apellidos: 'FINAL',
        razonSocial: 'CONSUMIDOR FINAL',
        email: dto.email?.trim().toLowerCase(),
        telefono: dto.telefono,
        telefonoSecundario: dto.telefonoSecundario,
        direccionDomicilio: dto.direccionDomicilio,
        aplicaTerceraEdad: false,
        aplicaDiscapacidad: false,
      },
    });

    return { message: 'Consumidor Final creado correctamente.', data: created };
  }

  private validarIdentificacion(
    tipo: TipoIdentificacion,
    identificacion: string,
  ) {
    if (!tipo)
      throw new BadRequestException('Tipo de identificación requerido');
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
      throw new BadRequestException('Nombres y apellidos son requeridos');
    }
  }

  private buildCreateData(
    dto: CreateClientDto,
    identificacion: string,
  ): Prisma.ClientesCreateInput {
    return {
      identificacion,
      tipoIdentificacion: dto.tipoIdentificacion,
      nombres: dto.nombres?.trim().toUpperCase() ?? '',
      apellidos: dto.apellidos?.trim().toUpperCase() ?? '',
      razonSocial: dto.razonSocial?.trim().toUpperCase(),
      email: dto.email?.trim().toLowerCase(),
      telefono: dto.telefono,
      telefonoSecundario: dto.telefonoSecundario,
      direccionDomicilio: dto.direccionDomicilio,
      aplicaTerceraEdad: dto.aplicaTerceraEdad ?? false,
      aplicaDiscapacidad: dto.aplicaDiscapacidad ?? false,
    };
  }
}
