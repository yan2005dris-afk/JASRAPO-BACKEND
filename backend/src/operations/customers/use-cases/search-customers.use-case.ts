import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

@Injectable()
export class SearchCustomersUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    tipo: 'identificacion' | 'nombres' | 'apellidos' | 'nombreCompleto',
    valor: string,
    page = 1,
    limit = 10,
  ) {
    if (!tipo || !valor)
      throw new BadRequestException('Debe enviar tipo y valor');

    if (tipo === 'identificacion' && valor.length < 3) {
      throw new BadRequestException(
        'La identificación debe tener al menos 3 caracteres',
      );
    }

    const skip = (page - 1) * limit;

    switch (tipo) {
      case 'identificacion':
        return this.prisma.clientes.findMany({
          where: {
            identificacion: { contains: valor, mode: 'insensitive' },
            deletedAt: null,
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        });

      case 'nombres':
      case 'apellidos':
        return this.prisma.clientes.findMany({
          where: {
            [tipo]: { contains: valor, mode: 'insensitive' },
            deletedAt: null,
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        });

      case 'nombreCompleto': {
        const tokens = valor
          .trim()
          .toUpperCase()
          .replace(/\s+/g, ' ')
          .split(' ')
          .filter(Boolean);
        return this.prisma.clientes.findMany({
          where: {
            AND: tokens.map((t) => ({
              OR: [
                { nombres: { contains: t, mode: 'insensitive' } },
                { apellidos: { contains: t, mode: 'insensitive' } },
              ],
            })),
            deletedAt: null,
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        });
      }

      default:
        throw new BadRequestException('Tipo inválido');
    }
  }
}
