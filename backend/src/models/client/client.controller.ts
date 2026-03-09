import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RequiredPermission } from 'src/common/decorators/require-permission.decorator';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@ApiTags('client')
@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  // PUBLICO
  @Get('search')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // Limitar a 10 peticiones por minuto
  search(
    @Query('tipo') tipo: string,
    @Query('valor') valor: string,
  ) {
    return this.clientService.search(tipo, valor);
  }

  // PRIVADO
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)

  @RequiredPermission('clients', 'create')
  @Post()
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientService.create(createClientDto);
  }

  @RequiredPermission('clients', 'read')
  @Get()
  findAll() {
    return this.clientService.findAll();
  }

  @RequiredPermission('clients', 'read')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientService.findOne(id);
  }

  @RequiredPermission('clients', 'update')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientService.update(id, updateClientDto);
  }

  @RequiredPermission('clients', 'delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientService.remove(id);
  }
}
