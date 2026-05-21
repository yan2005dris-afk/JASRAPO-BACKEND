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
import { WebhooksService } from './webhooks.service';
import { CreateWebhookDto, UpdateWebhookDto } from './dto/webhook.dto';

@ApiTags('SRI - Webhooks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('sri/webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post()
  @RequiredPermission('webhooks', 'create')
  @ApiOperation({ summary: 'Configurar nuevo webhook' })
  create(
    @Body() createWebhookDto: CreateWebhookDto,
  ) {
    return this.webhooksService.create(
      createWebhookDto,
    );
  }

  @Get()
  @RequiredPermission('webhooks', 'read')
  @ApiOperation({ summary: 'Listar configuraciones de webhooks' })
  findAll() {
    return this.webhooksService.findAll();
  }

  @Get(':id')
  @RequiredPermission('webhooks', 'read')
  @ApiOperation({ summary: 'Obtener configuración de webhook' })
  findOne(@Param('id') id: string) {
    return this.webhooksService.findOne(id);
  }

  @Put(':id')
  @RequiredPermission('webhooks', 'update')
  @ApiOperation({ summary: 'Actualizar configuración de webhook' })
  update(@Param('id') id: string, @Body() updateWebhookDto: UpdateWebhookDto) {
    return this.webhooksService.update(id, updateWebhookDto);
  }

  @Delete(':id')
  @RequiredPermission('webhooks', 'delete')
  @ApiOperation({ summary: 'Eliminar configuración de webhook' })
  remove(@Param('id') id: string) {
    return this.webhooksService.delete(id);
  }

  @Post(':id/regenerate-secret')
  @RequiredPermission('webhooks', 'update')
  @ApiOperation({ summary: 'Regenerar secreto HMAC del webhook' })
  regenerateSecret(@Param('id') id: string) {
    return this.webhooksService.regenerateSecret(id);
  }

  @Get(':id/logs')
  @RequiredPermission('webhooks', 'read')
  @ApiOperation({ summary: 'Ver logs de intentos de envío' })
  getLogs(@Param('id') id: string) {
    return this.webhooksService.getLogs(id);
  }
}
