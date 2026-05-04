import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { UpdateClientDto } from '../dto/update-client.dto';
import { TipoIdentificacionUtil } from 'src/infrastructure/common/util/tipo-identificacion.util';
import { safeClientesSelect } from '../types/IResponseClient';

@Injectable()
export class UpdateClientUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpdateClientDto) {
    const clienteId = BigInt(id);
    const cliente = await this.prisma.clientes.findFirst({
      where: { clienteId, deletedAt: null },
      include: { tipoIdentificacion: true },
    });

    if (!cliente) throw new NotFoundException('Cliente no encontrado');

    const tipoId = dto.tipoIdentificacionId 
      ? BigInt(dto.tipoIdentificacionId) 
      : cliente.tipoIdentificacionId!;
    const identificacionFinal = (
      dto.identificacion ?? cliente.identificacion
    ).trim();

    // Obtener el código del tipo de identificación
    const catalogo = await this.prisma.identificacion.findUnique({
      where: { identificacionId: tipoId },
    });

    if (!catalogo) {
      throw new BadRequestException('Tipo de identificación inválido');
    }

    if (
      catalogo.codigo !== 'CONSUMIDOR_FINAL' &&
      !TipoIdentificacionUtil.validar(catalogo.codigo, identificacionFinal)
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
      catalogo.codigo !== 'CONSUMIDOR_FINAL' &&
      (!nombres || !apellidos)
    ) {
      throw new BadRequestException('Nombres y apellidos son requeridos');
    }

    return this.prisma.clientes.update({
      where: { clienteId },
      data: {
        tipoIdentificacion: {
          connect: { identificacionId: tipoId },
        },
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
        aplicaTerceraEdad: dto.aplicaTerceraEdad ?? cliente.aplicaTerceraEdad,
        aplicaDiscapacidad:
          dto.aplicaDiscapacidad ?? cliente.aplicaDiscapacidad,
      },
      select: safeClientesSelect,
    });
  }
}