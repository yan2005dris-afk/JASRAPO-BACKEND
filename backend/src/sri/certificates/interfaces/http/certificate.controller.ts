import {
  Controller,
  Get,
  Post,
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
import { CertificateExpiryCronService } from '../../application/certificate-expiry-cron.service';

@ApiTags('[En Desarrollo] Certificados')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('sri/certificates')
export class CertificateController {
  constructor(
    private readonly certificateService: CertificateService,
    private readonly certificateExpiryCronService: CertificateExpiryCronService,
  ) {}

  @Get()
  @RequiredPermission('certificados', 'read')
  @ApiOperation({ summary: 'Listar certificados' })
  async findAll(@Query() query: any) {
    return this.certificateService.listCertificates(query);
  }

  @Post('check-expiry')
  @RequiredPermission('certificados', 'update')
  @ApiOperation({ summary: 'Ejecutar verificación manual de expiración de certificados' })
  async checkExpiry() {
    return this.certificateExpiryCronService.checkExpiringCertificates();
  }

  @Delete(':fileName')
  @RequiredPermission('certificados', 'delete')
  @ApiOperation({ summary: 'Eliminar certificado' })
  async remove(@Param('fileName') fileName: string) {
    return this.certificateService.deleteCertificate(fileName);
  }
}
