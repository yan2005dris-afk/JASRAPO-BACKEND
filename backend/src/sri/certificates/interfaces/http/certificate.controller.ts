import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/identity/auth/interfaces/http/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/infrastructure/common/guards/permissions.guard';
import { RequiredPermission } from 'src/infrastructure/common/decorators/require-permission.decorator';
import { CertificateService } from '../../application/certificate.service';

@ApiTags('[En Desarrollo] Certificados')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
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
