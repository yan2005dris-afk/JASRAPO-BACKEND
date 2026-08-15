import { Injectable } from '@nestjs/common';
import { ClientRepository } from '../../domain/repositories/client.repository';
import { CreateClientDto } from '../../interfaces/dto/create-client.dto';
import { TipoIdentificacionUtil } from 'src/shared/utils/tipo-identificacion.util';
import type { CreateClientData } from '../../domain/types/client.types';
import { InvalidDomainOperationException } from 'src/shared/domain/exceptions/domain.exception';
import { EntityAlreadyExistsException } from 'src/shared/domain/exceptions/domain.exception';
import type { ClientEntity } from '../../domain/entities/client.entity';

/** ID of CONSUMIDOR_FINAL in `catalogo_tipos_identificacion` */
const CONSUMIDOR_FINAL_TIPO_ID = 4;

@Injectable()
export class CreateClientUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(dto: CreateClientDto): Promise<ClientEntity> {
    // CONSUMIDOR_FINAL: the singleton invariant is enforced by the repository
    if (dto.tipoIdentificacionId === CONSUMIDOR_FINAL_TIPO_ID) {
      return this.clientRepository.reactivateOrCreateConsumidorFinal({
        email: dto.email?.trim().toLowerCase(),
        telefono: dto.telefono,
        telefonoSecundario: dto.telefonoSecundario,
        direccionDomicilio: dto.direccionDomicilio,
      });
    }

    if (!dto.identificacion) {
      throw new InvalidDomainOperationException(
        'La identificación es requerida para este tipo de cliente',
      );
    }

    const identificacion = dto.identificacion.trim();

    // Get the catalogo to validate identification type
    const catalogo = await this.clientRepository.findTipoIdentificacionById(
      dto.tipoIdentificacionId,
    );

    if (!catalogo) {
      throw new InvalidDomainOperationException(
        'Tipo de identificación inválido',
      );
    }

    this.validarIdentificacion(catalogo.codigo, identificacion);
    this.validarCamposBasicos(
      catalogo.codigo,
      dto.nombres,
      dto.apellidos,
      dto.tipoIdentificacionId,
      dto.razonSocial,
      dto.direccionDomicilio,
    );

    const existente =
      await this.clientRepository.findByIdentificacion(identificacion);

    const data = this.buildCreateData(dto, identificacion);

    if (existente) {
      if (existente.deletedAt !== null) {
        return this.clientRepository.updateClient(existente.clienteId, {
          ...data,
          deletedAt: null,
        });
      }
      throw new EntityAlreadyExistsException(
        'Cliente',
        'identificacion',
        identificacion,
      );
    }

    return this.clientRepository.create(data);
  }

  private validarIdentificacion(codigo: string, identificacion: string) {
    if (!codigo)
      throw new InvalidDomainOperationException(
        'Tipo de identificación requerido',
      );
    if (
      codigo !== '07' && // CONSUMIDOR_FINAL
      !TipoIdentificacionUtil.validar(codigo, identificacion)
    ) {
      throw new InvalidDomainOperationException('Identificación inválida');
    }
  }

  private validarCamposBasicos(
    codigo: string,
    nombres?: string,
    apellidos?: string,
    tipoIdentificacionId?: number,
    razonSocial?: string,
    direccionDomicilio?: string,
  ) {
    if (codigo === '07') return; // CONSUMIDOR_FINAL

    if (!nombres || !apellidos) {
      throw new InvalidDomainOperationException(
        'Nombres y apellidos son requeridos',
      );
    }

    if (codigo === '04' && !razonSocial) {
      // RUC
      throw new InvalidDomainOperationException(
        'La razón social es obligatoria para RUC',
      );
    }

    if (!direccionDomicilio) {
      throw new InvalidDomainOperationException(
        'La dirección de domicilio es obligatoria para facturación',
      );
    }
  }

  private buildCreateData(
    dto: CreateClientDto,
    identificacion: string,
  ): CreateClientData {
    return {
      identificacion,
      tipoIdentificacionId: dto.tipoIdentificacionId,
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
