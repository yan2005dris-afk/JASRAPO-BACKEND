import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { ClientRepository } from '../../domain/repositories/client.repository';
import { CreateClientDto } from '../../interfaces/dto/create-client.dto';
import { TipoIdentificacionUtil } from 'src/infrastructure/common/utils/tipo-identificacion.util';
import { safeClientesSelect } from '../../domain/types/IResponseClient';
import { Prisma } from 'src/generated/prisma/client';

@Injectable()
export class CreateClientUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(dto: CreateClientDto) {
    const tipoId = dto.tipoIdentificacionId;

    // CONSUMIDOR_FINAL tiene código '07'
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
    const catalogo = await this.clientRepository.findCatalogoTipoIdentificacion(
      { id: tipoId },
    );

    if (!catalogo) {
      throw new BadRequestException('Tipo de identificación inválido');
    }

    this.validarIdentificacion(catalogo.codigo, identificacion);
    this.validarCamposBasicos(catalogo.codigo, dto.nombres, dto.apellidos);

    const existente = await this.clientRepository.findUnique({
      identificacion,
    });

    const data = this.buildCreateData(dto, identificacion);

    if (existente) {
      if (existente.deletedAt !== null) {
        return this.clientRepository.update(
          { clienteId: existente.clienteId },
          { ...data, deletedAt: null },
          safeClientesSelect,
        );
      }
      throw new ConflictException('La identificación ya está registrada');
    }

    try {
      return await this.clientRepository.create(data, safeClientesSelect);
    } catch (error: any) {
      if (error.code === 'P2002')
        throw new ConflictException('La identificación ya está registrada');
      throw error;
    }
  }

  private async handleConsumidorFinal(dto: CreateClientDto) {
    const consumidores = await this.clientRepository.findMany({
      where: { tipoIdentificacionId: 4 }, // CONSUMIDOR_FINAL
      orderBy: { createdAt: 'asc' },
    });

    const principal = consumidores[0];

    if (principal) {
      if (consumidores.length > 1) {
        const duplicados = consumidores.slice(1);
        await this.clientRepository.updateMany(
          { clienteId: { in: duplicados.map((c) => c.clienteId) } },
          { deletedAt: new Date() },
        );
      }

      const updated = await this.clientRepository.update(
        { clienteId: principal.clienteId },
        {
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
        safeClientesSelect,
      );

      return {
        message: 'Consumidor Final reactivado correctamente.',
        data: updated,
      };
    }

    const created = await this.clientRepository.create(
      {
        identificacion: '9999999999999',
        tipoIdentificacion: {
          connect: { id: 4 },
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
      safeClientesSelect,
    );

    return { message: 'Consumidor Final creado correctamente.', data: created };
  }

  private validarIdentificacion(codigo: string, identificacion: string) {
    if (!codigo)
      throw new BadRequestException('Tipo de identificación requerido');
    if (
      codigo !== '07' && // CONSUMIDOR_FINAL
      !TipoIdentificacionUtil.validar(codigo, identificacion)
    ) {
      throw new BadRequestException('Identificación inválida');
    }
  }

  private validarCamposBasicos(
    codigo: string,
    nombres?: string,
    apellidos?: string,
  ) {
    if (codigo !== '07' && (!nombres || !apellidos)) {
      // CONSUMIDOR_FINAL
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
        connect: { id: dto.tipoIdentificacionId },
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
