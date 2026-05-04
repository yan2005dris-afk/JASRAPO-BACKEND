import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { CreateClientDto } from '../dto/create-client.dto';
import { TipoIdentificacionUtil } from 'src/infrastructure/common/util/tipo-identificacion.util';
import { safeClientesSelect } from '../types/IResponseClient';
import { Prisma } from 'src/generated/prisma/client';

@Injectable()
export class CreateClientUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateClientDto) {
    const tipoId = BigInt(dto.tipoIdentificacionId);

    // CONSUMIDOR_FINAL tiene ID 4
    if (dto.tipoIdentificacionId === 4) {
      return this.handleConsumidorFinal(dto);
    }

    if (!dto.identificacion) {
      throw new BadRequestException(
        'La identificación es requerida para este tipo de cliente',
      );
    }

    const identificacion = dto.identificacion.trim();
    
    // Obtener el código del tipo de identificación para validar
    const catalogo = await this.prisma.identificacion.findUnique({
      where: { identificacionId: tipoId },
    });
    
    if (!catalogo) {
      throw new BadRequestException('Tipo de identificación inválido');
    }

    this.validarIdentificacion(catalogo.codigo, identificacion);
    this.validarCamposBasicos(catalogo.codigo, dto.nombres, dto.apellidos);

    const existente = await this.prisma.clientes.findUnique({
      where: { identificacion },
    });

    const data = this.buildCreateData(dto, identificacion);

    if (existente) {
      if (existente.deletedAt !== null) {
        return this.prisma.clientes.update({
          where: { clienteId: existente.clienteId },
          data: { ...data, deletedAt: null },
          select: safeClientesSelect,
        });
      }
      throw new ConflictException('La identificación ya está registrada');
    }

    try {
      return await this.prisma.clientes.create({ data, select: safeClientesSelect });
    } catch (error: any) {
      if (error.code === 'P2002')
        throw new ConflictException('La identificación ya está registrada');
      throw error;
    }
  }

  private async handleConsumidorFinal(dto: CreateClientDto) {
    const consumidores = await this.prisma.clientes.findMany({
      where: { tipoIdentificacionId: BigInt(4) }, // CONSUMIDOR_FINAL
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
        select: safeClientesSelect,
      });

      return {
        message: 'Consumidor Final reactivado correctamente.',
        data: updated,
      };
    }

    const created = await this.prisma.clientes.create({
      data: {
        identificacion: '9999999999999',
        tipoIdentificacion: {
          connect: { identificacionId: BigInt(4) },
        }, // CONSUMIDOR_FINAL
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
      select: safeClientesSelect,
    });

    return { message: 'Consumidor Final creado correctamente.', data: created };
  }

  private validarIdentificacion(codigo: string, identificacion: string) {
    if (!codigo)
      throw new BadRequestException('Tipo de identificación requerido');
    if (
      codigo !== 'CONSUMIDOR_FINAL' &&
      !TipoIdentificacionUtil.validar(codigo, identificacion)
    ) {
      throw new BadRequestException('Identificación inválida');
    }
  }

  private validarCamposBasicos(codigo: string, nombres?: string, apellidos?: string) {
    if (
      codigo !== 'CONSUMIDOR_FINAL' &&
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
      tipoIdentificacion: {
        connect: { identificacionId: BigInt(dto.tipoIdentificacionId) },
      },
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