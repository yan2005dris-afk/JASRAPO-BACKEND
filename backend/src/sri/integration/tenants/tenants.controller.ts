import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/identity/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/infrastructure/common/guards/permissions.guard';
import { RequiredPermission } from 'src/infrastructure/common/decorators/require-permission.decorator';
import { TenantsService } from './tenants.service';
import { CreateTenantDto, UpdateTenantDto } from './dto/tenant.dto';

@ApiTags('SRI - Tenants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('sri/tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @RequiredPermission('tenants', 'create')
  @ApiOperation({ summary: 'Crear un nuevo tenant' })
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantsService.create(createTenantDto);
  }

  @Get()
  @RequiredPermission('tenants', 'read')
  @ApiOperation({ summary: 'Listar todos los tenants' })
  findAll() {
    return this.tenantsService.findAll();
  }

  @Get(':id')
  @RequiredPermission('tenants', 'read')
  @ApiOperation({ summary: 'Obtener un tenant por ID' })
  findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(id);
  }

  @Put(':id')
  @RequiredPermission('tenants', 'update')
  @ApiOperation({ summary: 'Actualizar un tenant' })
  update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto) {
    return this.tenantsService.update(id, updateTenantDto);
  }

  @Delete(':id')
  @RequiredPermission('tenants', 'delete')
  @ApiOperation({ summary: 'Eliminar un tenant' })
  remove(@Param('id') id: string) {
    return this.tenantsService.delete(id);
  }
}
