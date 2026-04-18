import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RequiredPermission } from 'src/common/decorators/require-permission.decorator';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { SearchClientDto } from './dto/search.client.dto';

@ApiTags('client')
@ApiBearerAuth()
//@UseGuards(JwtAuthGuard, PermissionsGuard) 
@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  /**
   * Búsqueda pública de clientes
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
  // SEARCH
  // =====================
  @RequiredPermission('clientes', 'read')
  @Get('search')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  searchPrivate(@Query() query: SearchClientDto) {
    return this.clientService.searchPrivate(
      query.tipo,
      query.valor,
      query.page,
      query.limit,
    );
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
  update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
  ) {
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
