import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { CertificateService } from './certificate.service';

@ApiTags('Certificados')
@Controller('sri/certificates')
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  @Get()
  @ApiOperation({ summary: 'Listar certificados' })
  async findAll(@Query() query: any) {
    return this.certificateService.listCertificates(query);
  }

  @Delete(':fileName')
  @ApiOperation({ summary: 'Eliminar certificado' })
  async remove(@Param('fileName') fileName: string) {
    return this.certificateService.deleteCertificate(fileName);
  }
}
