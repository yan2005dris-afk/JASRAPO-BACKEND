import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';
import { CreateWebhookDto, UpdateWebhookDto } from './dto/webhook.dto';

@ApiTags('SRI - Webhooks')
@Controller('sri/webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post()
  @ApiOperation({ summary: 'Configurar nuevo webhook' })
  create(@Body() createWebhookDto: CreateWebhookDto) {
    return this.webhooksService.create(createWebhookDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar configuraciones de webhooks' })
  findAll() {
    return this.webhooksService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener configuración de webhook' })
  findOne(@Param('id') id: string) {
    return this.webhooksService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar configuración de webhook' })
  update(@Param('id') id: string, @Body() updateWebhookDto: UpdateWebhookDto) {
    return this.webhooksService.update(id, updateWebhookDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar configuración de webhook' })
  remove(@Param('id') id: string) {
    return this.webhooksService.delete(id);
  }
}
