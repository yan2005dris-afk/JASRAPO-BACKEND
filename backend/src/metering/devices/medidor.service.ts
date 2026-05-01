import { Injectable } from '@nestjs/common';
import { Prisma, Medidores } from 'src/generated/prisma/client';
import { CrearMedidorDto } from './dto/create-medidor.dto';
import { ActualizarMedidorDto } from './dto/update-medidor.dto';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { CreateDeviceUseCase } from './use-cases/create-device.use-case';
import { FindOneDeviceUseCase } from './use-cases/find-one-device.use-case';
import { InstallDeviceUseCase } from './use-cases/install-device.use-case';
import { ReportDeviceDamageUseCase } from './use-cases/report-device-damage.use-case';
import { DecommissionDeviceUseCase } from './use-cases/decommission-device.use-case';

@Injectable()
export class MedidorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createUseCase: CreateDeviceUseCase,
    private readonly findOneUseCase: FindOneDeviceUseCase,
    private readonly installUseCase: InstallDeviceUseCase,
    private readonly reportDamageUseCase: ReportDeviceDamageUseCase,
    private readonly decommissionUseCase: DecommissionDeviceUseCase,
  ) {}

  async crearMedidor(createDto: CrearMedidorDto): Promise<Medidores> {
    return this.createUseCase.execute(createDto);
  }

  async buscarMedidores(params: {
    skip?: number;
    take?: number;
    where?: Prisma.MedidoresWhereInput;
  }): Promise<Medidores[]> {
    return await this.prisma.medidores.findMany({
      ...params,
      where: { ...params.where, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async buscarMedidor(id: bigint): Promise<Medidores> {
    return this.findOneUseCase.execute(id);
  }

  async actualizarMedidor(
    id: bigint,
    updateDto: ActualizarMedidorDto,
  ): Promise<Medidores> {
    await this.findOneUseCase.execute(id);
    return await this.prisma.medidores.update({
      where: { medidorId: id },
      data: updateDto,
    });
  }

  async eliminarMedidor(id: bigint): Promise<{ message: string }> {
    await this.findOneUseCase.execute(id);
    await this.prisma.medidores.update({
      where: { medidorId: id },
      data: { deletedAt: new Date() },
    });
    return { message: `Medidor con ID ${id} eliminado lógicamente` };
  }

  async instalarMedidor(
    medidorId: bigint,
    contratoId: bigint,
  ): Promise<Medidores> {
    return this.installUseCase.execute(medidorId, contratoId);
  }

  async reportarDano(medidorId: bigint): Promise<Medidores> {
    return this.reportDamageUseCase.execute(medidorId);
  }

  async facturarPorPromedio(medidorId: bigint): Promise<Medidores> {
    // Esta lógica de transición de estado también podría ser un Use Case si crece
    return await this.prisma.medidores.update({
      where: { medidorId },
      data: { estado: 'ESTIMADO' as any },
    });
  }

  async darDeBaja(medidorId: bigint, motivoBaja: string): Promise<Medidores> {
    return this.decommissionUseCase.execute(medidorId, motivoBaja);
  }
}
