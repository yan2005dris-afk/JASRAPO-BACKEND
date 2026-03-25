import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientService {
  constructor(private prisma: PrismaService) {}

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

  async create(createClientDto: CreateClientDto) {
    const { nombres, apellidos, identificacion, tipoIdentificacion, email, telefono, aplicaTerceraEdadDiscapacidad } = createClientDto;

    if (identificacion && !this.validarCedula(identificacion)) {
      throw new BadRequestException('La cédula ingresada no es válida');
    }

    const clienteExistente = await this.prisma.clientes.findUnique({
      where: { identificacion },
    });

    if (clienteExistente) {
      throw new ConflictException('La identificación ya está registrada');
    }

    return this.prisma.clientes.create({
      data: {
        identificacion,
        tipoIdentificacion: tipoIdentificacion || 'CEDULA',
        nombres,
        apellidos,
        email,
        telefono,
        aplicaTerceraEdadDiscapacidad: aplicaTerceraEdadDiscapacidad || false,
      },
    });
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
    await this.findOne(id);

    const { nombres, apellidos, identificacion, email, telefono, aplicaTerceraEdadDiscapacidad } = updateClientDto;

    if (identificacion) {
      if (!this.validarCedula(identificacion)) {
        throw new BadRequestException('Cédula inválida');
      }

      const clienteExistente = await this.prisma.clientes.findFirst({
        where: {
          identificacion,
          NOT: {
            clienteId: BigInt(id),
          },
        },
      });

      if (clienteExistente) {
        throw new ConflictException('La identificación ya está registrada');
      }
    }

    return this.prisma.clientes.update({
      where: {
        clienteId: BigInt(id),
      },
      data: {
        ...(nombres && { nombres }),
        ...(apellidos && { apellidos }),
        ...(identificacion && { identificacion }),
        ...(email !== undefined && { email }),
        ...(telefono !== undefined && { telefono }),
        ...(aplicaTerceraEdadDiscapacidad !== undefined && { aplicaTerceraEdadDiscapacidad }),
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

  async search(tipo: string, valor: string) {
    if (!tipo || !valor) {
      throw new BadRequestException(
        'Debe enviar tipo y valor para la búsqueda',
      );
    }

    const tiposValidos = ['identificacion', 'nombres', 'apellidos'];

    if (!tiposValidos.includes(tipo)) {
      throw new BadRequestException('Tipo de búsqueda inválido');
    }

    switch (tipo) {
      case 'identificacion':
        if (!this.validarCedula(valor)) {
          throw new BadRequestException('Cédula inválida');
        }

        return this.prisma.clientes.findMany({
          where: {
            identificacion: valor,
            deletedAt: null,
          },
        });

      case 'nombres':
        return this.prisma.clientes.findMany({
          where: {
            nombres: {
              contains: valor,
              mode: 'insensitive',
            },
            deletedAt: null,
          },
        });

      case 'apellidos':
        return this.prisma.clientes.findMany({
          where: {
            apellidos: {
              contains: valor,
              mode: 'insensitive',
            },
            deletedAt: null,
          },
        });
    }
  }
}
