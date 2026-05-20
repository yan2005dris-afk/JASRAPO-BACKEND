import { Controller, Get, Delete, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
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
