import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequiredPermission } from 'src/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@ApiTags('client')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

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
