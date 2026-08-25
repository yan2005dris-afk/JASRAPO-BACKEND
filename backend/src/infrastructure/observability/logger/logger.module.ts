import { Module, Global } from '@nestjs/common';
import { LOGGER_PORT } from 'src/shared/domain/ports/logger.port';
import { LoggerService } from './logger.service';

@Global()
@Module({
  providers: [
    LoggerService,
    { provide: LOGGER_PORT, useExisting: LoggerService },
  ],
  exports: [LoggerService, LOGGER_PORT],
})
export class LoggerModule {}
