import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from 'src/generated/prisma/client';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientService {
  constructor(private prisma: PrismaClient) {}

  async create(createClientDto: CreateClientDto) {
    const { nombre, comunidadId } = createClientDto;

    //Validar cliente duplicado, proximamente validar mediante cedula
    const clienteExistente = await this.prisma.clientes.findFirst({
      where: {nombre},
    });

    if(clienteExistente){
      throw new ConflictException('El cliente ya está registrado');
    }

    //Validar que la comunidad exista
    if(comunidadId){
      const comunidadExistente = await this.prisma.comunidades.findUnique({
        where: {comunidadId: BigInt(comunidadId)},
      });
      if(!comunidadExistente){
        throw new NotFoundException('La comunidad no existe');
      }
    }

    return this.prisma.clientes.create({
      data: {
        nombre,
        comunidadId: comunidadId ? BigInt(comunidadId) : null,
      },
    });
  }

  async findAll() {
    return this.prisma.clientes.findMany({
      include:{
        comunidad: true,
      },
    });
  }

  async findOne(id: string) {
    const cliente = await this.prisma.clientes.findUnique({
      where:{
        clienteId: BigInt(id),
      },
      include:{
        comunidad: true,
      },
    });

    if(!cliente){
      throw new NotFoundException('Cliente no encontrado');
    }
    return cliente;
  }

  async update(id: string, updateClientDto: UpdateClientDto) {
    await this.findOne(id); // Verificar que el cliente existe antes de actualizar
    const { nombre, comunidadId } = updateClientDto;

    //Evitar duplicados si se actualiza el nombre
    if(nombre){
      const clienteExistente = await this.prisma.clientes.findFirst({
        where:{
          nombre,
          NOT: {
            clienteId: BigInt(id),
          },
        },
      });

      if(clienteExistente){
        throw new ConflictException('El cliente ya está registrado');
      }
    }

    //Validar comunidad si la envían
    if(comunidadId){
      const comunidadExistente = await this.prisma.comunidades.findUnique({
        where: {comunidadId: BigInt(comunidadId)},
      });
      if(!comunidadExistente){
        throw new NotFoundException('La comunidad no existe');
      }
    }
    return this.prisma.clientes.update({
      where: {
        clienteId: BigInt(id),
      },
      data: {
        ...(nombre && { nombre }),
        ...(comunidadId !== undefined && {
          comunidadId: comunidadId ? BigInt(comunidadId) : null,
        }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Verificar que el cliente existe antes de eliminar
    await this.prisma.clientes.delete({
      where: {
        clienteId: BigInt(id),
      }
    });
  }
}
