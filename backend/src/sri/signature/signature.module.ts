import { Module } from '@nestjs/common';
import { SignatureController } from './interfaces/http/signature.controller';
import { SignatureService } from './application/signature.service';

@Module({
  controllers: [SignatureController],
  providers: [SignatureService],
  exports: [SignatureService],
})
export class SignatureModule {}
