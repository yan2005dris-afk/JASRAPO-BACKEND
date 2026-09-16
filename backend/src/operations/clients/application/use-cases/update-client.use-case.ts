import { Injectable } from '@nestjs/common';
import { ClientRepository } from '../../domain/repositories/client.repository';
import { UpdateClientDto } from '../../interfaces/dto/update-client.dto';
import { TipoIdentificacionUtil } from 'src/shared/utils/tipo-identificacion.util';
import { TerceraEdadUtil } from '../../domain/tercera-edad.util';
import { ClientEntity } from '../../domain/entities/client.entity';
import {
  EntityAlreadyExistsException,
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class UpdateClientUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(id: bigint, dto: UpdateClientDto): Promise<ClientEntity> {
    const cliente = await this.clientRepository.findById(id);

    if (!cliente) throw new EntityNotFoundException('Cliente', id);

    const tipoId =
      dto.tipoIdentificacionId ?? cliente.tipoIdentificacion?.id ?? 0;
    const identificacionFinal = (
      dto.identificacion ?? cliente.identificacion
    ).trim();

    // Get catalogo to validate identification type
    const catalogo =
      await this.clientRepository.findTipoIdentificacionById(tipoId);

    if (!catalogo) {
      throw new InvalidDomainOperationException(
        'Tipo de identificación inválido',
      );
    }

    if (
      catalogo.codigo !== '07' && // CONSUMIDOR_FINAL
      !TipoIdentificacionUtil.validar(catalogo.codigo, identificacionFinal)
    ) {
      throw new InvalidDomainOperationException('Identificación inválida');
    }

    if (dto.identificacion) {
      const existente =
        await this.clientRepository.findByIdentificacion(identificacionFinal);
      if (existente && existente.clienteId !== id) {
        throw new EntityAlreadyExistsException(
          'Cliente',
          'identificacion',
          identificacionFinal,
        );
      }
    }

    const nombres = (dto.nombres ?? cliente.nombres)?.trim().toUpperCase();
    const apellidos = (dto.apellidos ?? cliente.apellidos)
      ?.trim()
      .toUpperCase();

    if (catalogo.codigo !== '07' && (!nombres || !apellidos)) {
      throw new InvalidDomainOperationException(
        'Nombres y apellidos son requeridos',
      );
    }

    return this.clientRepository.updateClient(id, {
      tipoIdentificacionId: tipoId,
      identificacion: identificacionFinal,
      nombres,
      apellidos,
      razonSocial: dto.razonSocial?.trim().toUpperCase() ?? cliente.razonSocial,
      email: dto.email?.trim().toLowerCase() ?? cliente.email,
      telefono: dto.telefono ?? cliente.telefono,
      telefonoSecundario: dto.telefonoSecundario ?? cliente.telefonoSecundario,
      direccionDomicilio: dto.direccionDomicilio ?? cliente.direccionDomicilio,
      aplicaTerceraEdad:
        dto.fechaNacimiento !== undefined && dto.fechaNacimiento !== ''
          ? TerceraEdadUtil.aplica(dto.fechaNacimiento)
          : cliente.aplicaTerceraEdad,
      aplicaDiscapacidad: dto.aplicaDiscapacidad ?? cliente.aplicaDiscapacidad,
    });
  }
}
