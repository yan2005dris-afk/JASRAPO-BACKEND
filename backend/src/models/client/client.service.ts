import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from 'src/generated/prisma/client';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientService {
  constructor(private prisma: PrismaClient) {}

  //Validar cédula
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
      let valor = parseInt(cedula.substring(i, i + 1)) * coeficiente;
      total += valor >= 10 ? valor - 9 : valor;
      coeficiente = coeficiente === 2 ? 1 : 2;
    }

    const residuo = total % 10;
    const resultado = residuo === 0 ? 0 : 10 - residuo;

    return resultado === digitoVerificador;
  }

  async create(createClientDto: CreateClientDto) {
    const { nombre, cedula, comunidadId } = createClientDto;

    if (!this.validarCedula(cedula)) {
      throw new BadRequestException('La cédula ingresada no es válida');
    }

    const clienteExistente = await this.prisma.clientes.findUnique({
      where: { cedula },
    });

    if (clienteExistente) {
      throw new ConflictException('La cédula ya está registrada');
    }

    if (comunidadId) {
      const comunidadExistente = await this.prisma.comunidades.findUnique({
        where: { comunidadId: BigInt(comunidadId) },
      });

      if (!comunidadExistente) {
        throw new NotFoundException('La comunidad no existe');
      }
    }

    return this.prisma.clientes.create({
      data: {
        nombre,
        cedula,
        comunidadId: comunidadId ? BigInt(comunidadId) : null,
      },
    });
  }

  async findAll() {
    return this.prisma.clientes.findMany({
      where:{
        deletedAt: null
      },
      include:{
        comunidad:true,
        clientesMedidores:{
          where:{
            fechaRetiro:null
          },
          include:{
            medidor:true
          }
        }
      }
    });
  }

  async findOne(id: string) {
    const cliente = await this.prisma.clientes.findFirst({
      where:{
        clienteId: BigInt(id),
        deletedAt: null
      },
      include:{
        comunidad: true,
        clientesMedidores:{
          where:{
            fechaRetiro:null
          },
          include:{
            medidor:true
          }
        }
      },
    });

    if(!cliente){
      throw new NotFoundException('Cliente no encontrado');
    }

    return cliente;
  }

  async update(id: string, updateClientDto: UpdateClientDto) {
    await this.findOne(id);

    const { nombre, cedula, comunidadId } = updateClientDto;

    if (cedula) {
      if (!this.validarCedula(cedula)) {
        throw new BadRequestException('Cédula inválida');
      }

      const clienteExistente = await this.prisma.clientes.findFirst({
        where: {
          cedula,
          NOT: {
            clienteId: BigInt(id),
          },
        },
      });

      if (clienteExistente) {
        throw new ConflictException('La cédula ya está registrada');
      }
    }

    if (comunidadId) {
      const comunidadExistente = await this.prisma.comunidades.findUnique({
        where: { comunidadId: BigInt(comunidadId) },
      });

      if (!comunidadExistente) {
        throw new NotFoundException('La comunidad no existe');
      }
    }

    return this.prisma.clientes.update({
      where: {
        clienteId: BigInt(id),
      },
      data: {
        ...(nombre && { nombre }),
        ...(cedula && { cedula }),
        ...(comunidadId !== undefined && {
          comunidadId: comunidadId ? BigInt(comunidadId) : null,
        }),
      },
    });
  }

  async remove(id: string) {

    const cliente = await this.prisma.clientes.findFirst({
      where:{
        clienteId: BigInt(id),
        deletedAt: null
      }
    });

    if(!cliente){
      throw new NotFoundException('Cliente no encontrado');
    }

    return this.prisma.clientes.update({
      where:{
        clienteId: BigInt(id)
      },
      data:{
        deletedAt: new Date()
      }
    });

  }

  async search(tipo: string, valor: string) {

    if (!tipo || !valor) {
      throw new BadRequestException('Debe enviar tipo y valor para la búsqueda');
    }

    const tiposValidos = ['cedula', 'nombre', 'contrato'];

    if (!tiposValidos.includes(tipo)) {
      throw new BadRequestException('Tipo de búsqueda inválido');
    }

    switch (tipo) {

      case 'cedula':

        if (!this.validarCedula(valor)) {
          throw new BadRequestException('Cédula inválida');
        }

        return this.prisma.clientes.findMany({
          where: {
            cedula: valor,
            deletedAt: null
          },
          include: {
            comunidad: true,
            clientesMedidores: {
              where: { fechaRetiro: null },
              include: { medidor: true }
            }
          }
        });

      case 'nombre':

        return this.prisma.clientes.findMany({
          where: {
            nombre: {
              contains: valor,
              mode: 'insensitive'
            },
            deletedAt: null
          },
          include: {
            comunidad: true,
            clientesMedidores: {
              where: { fechaRetiro: null },
              include: { medidor: true }
            }
          }
        });

      case 'contrato':

        return this.prisma.clientes.findMany({
          where: {
            deletedAt: null,
            clientesMedidores: {
              some: {
                contrato: valor,
                fechaRetiro: null
              }
            }
          },
          include: {
            comunidad: true,
            clientesMedidores: {
              where: { contrato: valor },
              include: { medidor: true }
            }
          }
        });
    }
  }
}
