import { Module, Global } from '@nestjs/common';
import { SriBaseService } from './sri-base.service';
import { CatalogoValidatorService } from './catalogo-validator.service';

@Global()
@Module({
  providers: [
    SriBaseService,
    CatalogoValidatorService,
  ],
  exports: [
    SriBaseService,
    CatalogoValidatorService,
  ],
})
export class UtilsModule {}
