import { Controller, Get, Delete, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { RequiredPermission } from 'src/common/decorators/require-permission.decorator';
import { CertificateService } from '../../application/certificate.service';

@ApiTags('[SRI] Certificados')
@ApiBearerAuth()
@Controller('sri/certificates')
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  @Get()
  @RequiredPermission('certificados', 'read')
  @ApiOperation({ summary: 'Listar certificados' })
  async findAll(@Query() query: any) {
    return this.certificateService.listCertificates(query);
  }

  @Delete(':fileName')
  @RequiredPermission('certificados', 'delete')
  @ApiOperation({ summary: 'Eliminar certificado' })
  async remove(@Param('fileName') fileName: string) {
    return this.certificateService.deleteCertificate(fileName);
  }
}
