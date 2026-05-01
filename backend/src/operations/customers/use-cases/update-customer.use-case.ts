import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { UpdateClientDto } from '../dto/update-client.dto';
import { TipoIdentificacion } from 'src/generated/prisma/enums';
import { TipoIdentificacionUtil } from 'src/infrastructure/common/util/tipo-identificacion.util';

@Injectable()
export class UpdateCustomerUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpdateClientDto) {
    const clienteId = BigInt(id);
    const cliente = await this.prisma.clientes.findFirst({
      where: { clienteId, deletedAt: null },
    });

    if (!cliente) throw new NotFoundException('Cliente no encontrado');

    const tipoFinal = dto.tipoIdentificacion ?? cliente.tipoIdentificacion;
    const identificacionFinal = (
      dto.identificacion ?? cliente.identificacion
    ).trim();

    if (
      tipoFinal !== TipoIdentificacion.CONSUMIDOR_FINAL &&
      !TipoIdentificacionUtil.validar(tipoFinal, identificacionFinal)
    ) {
      throw new BadRequestException('Identificación inválida');
    }

    if (dto.identificacion) {
      const existente = await this.prisma.clientes.findUnique({
        where: { identificacion: identificacionFinal },
      });
      if (existente && existente.clienteId !== clienteId) {
        throw new ConflictException('La identificación ya está registrada');
      }
    }

    const nombres = (dto.nombres ?? cliente.nombres)?.trim().toUpperCase();
    const apellidos = (dto.apellidos ?? cliente.apellidos)
      ?.trim()
      .toUpperCase();

    if (
      tipoFinal !== TipoIdentificacion.CONSUMIDOR_FINAL &&
      (!nombres || !apellidos)
    ) {
      throw new BadRequestException('Nombres y apellidos son requeridos');
    }

    return this.prisma.clientes.update({
      where: { clienteId },
      data: {
        tipoIdentificacion: tipoFinal,
        identificacion: identificacionFinal,
        nombres,
        apellidos,
        razonSocial:
          dto.razonSocial?.trim().toUpperCase() ?? cliente.razonSocial,
        email: dto.email?.trim().toLowerCase() ?? cliente.email,
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
}
