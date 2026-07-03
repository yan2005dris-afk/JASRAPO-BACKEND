import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClientRepository } from '../../domain/repositories/client.repository';
import { UpdateClientDto } from '../../interfaces/dto/update-client.dto';
import { TipoIdentificacionUtil } from 'src/shared/utils/tipo-identificacion.util';
import { ClientEntity } from '../../domain/entities/client.entity';

@Injectable()
export class UpdateClientUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(id: bigint, dto: UpdateClientDto): Promise<ClientEntity> {
    const cliente = await this.clientRepository.findFirst({
      clienteId: id,
      deletedAt: null,
    });

    if (!cliente) throw new NotFoundException('Cliente no encontrado');

    const tipoId = dto.tipoIdentificacionId
      ? dto.tipoIdentificacionId
      : (cliente.tipoIdentificacion?.id ?? 0);
    const identificacionFinal = (
      dto.identificacion ?? cliente.identificacion
    ).trim();

    // Get catalogo to validate identification type
    const catalogo = await this.clientRepository.findCatalogoTipoIdentificacion(
      { id: tipoId },
    );

    if (!catalogo) {
      throw new BadRequestException('Tipo de identificación inválido');
    }

    if (
      catalogo.codigo !== '07' && // CONSUMIDOR_FINAL
      !TipoIdentificacionUtil.validar(catalogo.codigo, identificacionFinal)
    ) {
      throw new BadRequestException('Identificación inválida');
    }

    if (dto.identificacion) {
      const existente = await this.clientRepository.findUnique({
        identificacion: identificacionFinal,
      });
      if (existente && existente.clienteId !== id) {
        throw new ConflictException('La identificación ya está registrada');
      }
    }

    const nombres = (dto.nombres ?? cliente.nombres)?.trim().toUpperCase();
    const apellidos = (dto.apellidos ?? cliente.apellidos)
      ?.trim()
      .toUpperCase();

    if (catalogo.codigo !== '07' && (!nombres || !apellidos)) {
      throw new BadRequestException('Nombres y apellidos son requeridos');
    }

    return this.clientRepository.update(
      { clienteId: id },
      {
        tipoIdentificacion: {
          connect: { id: tipoId },
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
    );
  }
}
