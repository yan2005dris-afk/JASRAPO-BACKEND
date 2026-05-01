import { Module } from '@nestjs/common';
import { MedidorService } from './medidor.service';
import { MedidorController } from './medidor.controller';
import { CreateDeviceUseCase } from './use-cases/create-device.use-case';
import { FindOneDeviceUseCase } from './use-cases/find-one-device.use-case';
import { InstallDeviceUseCase } from './use-cases/install-device.use-case';
import { ReportDeviceDamageUseCase } from './use-cases/report-device-damage.use-case';
import { DecommissionDeviceUseCase } from './use-cases/decommission-device.use-case';

@Module({
  controllers: [MedidorController],
  providers: [
    MedidorService,
    CreateDeviceUseCase,
    FindOneDeviceUseCase,
    InstallDeviceUseCase,
    ReportDeviceDamageUseCase,
    DecommissionDeviceUseCase,
  ],
  exports: [
    CreateDeviceUseCase,
    FindOneDeviceUseCase,
    InstallDeviceUseCase,
    ReportDeviceDamageUseCase,
    DecommissionDeviceUseCase,
  ],
})
export class MedidorModule {}
