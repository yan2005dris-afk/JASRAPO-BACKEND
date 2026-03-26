import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { TipoIdentificacion } from 'src/generated/prisma/enums';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientService {
  constructor(private prisma: PrismaService) {}

  /**
   * Validaciones según el tipo de documento
   */
  
  private validarCedula(cedula: string): boolean {
    if (cedula.length !== 10 || !/^\d+$/.test(cedula)) {
      return false;
    }

    const provincia = parseInt(cedula.substring(0, 2));
    if (provincia < 1 || provincia > 24) return false;

    const digitoVerificador = parseInt(cedula.substring(9, 10));

    let total = 0;
    let coeficiente = 2;

    for (let i = 0; i < 9; i++) {
      const valor = parseInt(cedula.substring(i, i + 1)) * coeficiente;
      total += valor >= 10 ? valor - 9 : valor;
      coeficiente = coeficiente === 2 ? 1 : 2;
    }

    const residuo = total % 10;
    const resultado = residuo === 0 ? 0 : 10 - residuo;

    return resultado === digitoVerificador;
  }

  private validarRuc(ruc: string): boolean {
    return /^\d{13}$/.test(ruc) && this.validarCedula(ruc.substring(0, 10)) && ruc.endsWith('001');
  }

  private validarPasaporteEcuatoriano(pasaporte: string): boolean {
    return /^[A-Za-z]{2}\d{7}$/.test(pasaporte);
  }

  private validarDocumentoExtranjero(doc: string): boolean {
    return doc.length >= 6; // validación simple de longitud
  }

  private validarIdentificacion(tipo: TipoIdentificacion, valor: string): boolean {
    switch (tipo) {
      case 'CEDULA':
        return this.validarCedula(valor);
      case 'RUC':
        return this.validarRuc(valor);
      case 'PASAPORTE':
        return this.validarPasaporteEcuatoriano(valor);
      case 'IDENTIFICACION_EXTRANJERA':
        return this.validarDocumentoExtranjero(valor);
      case 'CONSUMIDOR_FINAL':
        return true;
      default:
        return false;
    }
  }

  // ============================
  // Normalización de datos
  // ============================
  private normalizar(text?: string): string | undefined {
    return text?.trim().toUpperCase();
  }

  async create(createClientDto: CreateClientDto) {
    const {
      nombres,
      apellidos,
      identificacion,
      tipoIdentificacion,
      email,
      telefono,
      aplicaTerceraEdadDiscapacidad,
      razonSocial,
    } = createClientDto;

    let dataFinal: any;

    // Consumidor Final único
    if (tipoIdentificacion === 'CONSUMIDOR_FINAL') {
      const existeCF = await this.prisma.clientes.findFirst({
        where: { tipoIdentificacion: 'CONSUMIDOR_FINAL' },
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
        email,
        telefono,
        aplicaTerceraEdadDiscapacidad: false,
      };
    } else {
      if (!identificacion || !this.validarIdentificacion(tipoIdentificacion, identificacion)) {
        throw new BadRequestException('Identificación inválida o requerida');
      }

      dataFinal = {
        identificacion,
        tipoIdentificacion,
        nombres: this.normalizar(nombres),
        apellidos: this.normalizar(apellidos),
        razonSocial: this.normalizar(razonSocial),
        email,
        telefono,
        aplicaTerceraEdadDiscapacidad: aplicaTerceraEdadDiscapacidad || false,
      };
    }

    try {
      return await this.prisma.clientes.create({ data: dataFinal });
    } catch (error: any) {
      // Manejo de duplicado por unique constraint
      if (error.code === 'P2002') {
        throw new ConflictException('La identificación ya está registrada');
      }
      throw error;
    }
  }


  async findAll() {
    return this.prisma.clientes.findMany({
      where: {
        deletedAt: null,
      },
    });
  }

  async findOne(id: string) {
    const cliente = await this.prisma.clientes.findFirst({
      where: {
        clienteId: BigInt(id),
        deletedAt: null,
      },
    });

    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }

    return cliente;
  }

  async update(id: string, updateClientDto: UpdateClientDto) {
    const clienteExistente = await this.findOne(id);
    const {
      tipoIdentificacion,
      identificacion,
      nombres,
      apellidos,
      razonSocial,
      email,
      telefono,
      aplicaTerceraEdadDiscapacidad,
    } = updateClientDto;

    // Si cambia tipoIdentificacion, debe enviar identificacion válida
    if (tipoIdentificacion && !identificacion) {
      throw new BadRequestException(
        'Debe enviar identificación al actualizar tipo de documento',
      );
    }

    // Validar identificación si existe
    if (identificacion && tipoIdentificacion) {
      if (!this.validarIdentificacion(tipoIdentificacion, identificacion)) {
        throw new BadRequestException('Identificación inválida');
      }

      const dup = await this.prisma.clientes.findFirst({
        where: {
          identificacion,
          NOT: { clienteId: BigInt(id) },
        },
      });

      if (dup) {
        throw new ConflictException('La identificación ya está registrada');
      }
    }

    return this.prisma.clientes.update({
      where: { clienteId: BigInt(id) },
      data: {
        ...(tipoIdentificacion && { tipoIdentificacion }),
        ...(identificacion && { identificacion }),
        ...(nombres && { nombres: this.normalizar(nombres) }),
        ...(apellidos && { apellidos: this.normalizar(apellidos) }),
        ...(razonSocial && { razonSocial: this.normalizar(razonSocial) }),
        ...(email !== undefined && { email }),
        ...(telefono !== undefined && { telefono }),
        ...(aplicaTerceraEdadDiscapacidad !== undefined && {
          aplicaTerceraEdadDiscapacidad,
        }),
      },
    });
  }

  async remove(id: string) {
    const cliente = await this.prisma.clientes.findFirst({
      where: {
        clienteId: BigInt(id),
        deletedAt: null,
      },
    });

    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }

    return this.prisma.clientes.update({
      where: {
        clienteId: BigInt(id),
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async search(
  tipo: 'identificacion' | 'nombres' | 'apellidos' | 'nombreCompleto',
  valor: string,
  page = 1,
  limit = 10,
) {
  if (!tipo || !valor) {
    throw new BadRequestException('Debe enviar tipo y valor para la búsqueda');
  }

  const skip = (page - 1) * limit;

  switch (tipo) {
    case 'identificacion':
      // Validar que tenga longitud mínima para cualquier tipo de documento
      if (valor.length < 6) {
        throw new BadRequestException('Identificación inválida');
      }
      return this.prisma.clientes.findMany({
        where: {
          identificacion: valor,
          deletedAt: null,
        },
        skip,
        take: limit,
      });

    case 'nombres':
      return this.prisma.clientes.findMany({
        where: {
          nombres: { contains: valor, mode: 'insensitive' },
          deletedAt: null,
        },
        skip,
        take: limit,
      });

    case 'apellidos':
      return this.prisma.clientes.findMany({
        where: {
          apellidos: { contains: valor, mode: 'insensitive' },
          deletedAt: null,
        },
        skip,
        take: limit,
      });

    case 'nombreCompleto':
      // Buscar combinando nombres + apellidos
      return this.prisma.clientes.findMany({
        where: {
          AND: [
            { nombres: { contains: valor, mode: 'insensitive' } },
            { apellidos: { contains: valor, mode: 'insensitive' } },
          ],
          deletedAt: null,
        },
        skip,
        take: limit,
      });

    default:
      throw new BadRequestException('Tipo de búsqueda inválido');
  }
}
}
