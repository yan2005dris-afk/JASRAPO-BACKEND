import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { RequiredPermission } from 'src/common/decorators/require-permission.decorator';
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@ApiTags('client')
@ApiBearerAuth()
//@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  /**
   * Búsqueda de clientes (Pública y Privada unificada)
   * Query params:
   *  - tipo: identificacion | nombres | apellidos | nombreCompleto
   *  - valor: texto a buscar
   *  - page: opcional, página de resultados (default 1)
   *  - limit: opcional, cantidad de resultados por página (default 10)
   */
  @Get('search')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  search(
    @Query('tipo')
    tipo: 'identificacion' | 'nombres' | 'apellidos' | 'nombreCompleto',
    @Query('valor') valor: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.clientService.search(tipo, valor, pageNumber, limitNumber);
  }

  // =====================
  // CREATE
  // =====================
  @RequiredPermission('clientes', 'create')
  @Post()
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientService.create(createClientDto);
  }

  // =====================
  // FIND ALL
  // =====================
  @RequiredPermission('clientes', 'read')
  @Get()
  findAll() {
    return this.clientService.findAll();
  }

  // =====================
  // FIND ONE
  // =====================
  @RequiredPermission('clientes', 'read')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientService.findOne(id);
  }

  // =====================
  // UPDATE
  // =====================
  @RequiredPermission('clientes', 'update')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientService.update(id, updateClientDto);
  }

  // =====================
  // DELETE (SOFT DELETE)
  // =====================
  @RequiredPermission('clientes', 'delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientService.remove(id);
  }
}
