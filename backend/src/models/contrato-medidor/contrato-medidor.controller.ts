import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ContratoMedidorService } from './contrato-medidor.service';
import { CrearContratoMedidorDto } from './dto/create-contrato-medidor.dto';
import { ActualizarContratoMedidorDto } from './dto/update-contrato-medidor.dto';

@Controller('contrato-medidor')
export class ContratoMedidorController {
  constructor(private readonly contratoMedidorService: ContratoMedidorService) {}

  @Post()
  crear(@Body() createDto: CrearContratoMedidorDto) { return this.contratoMedidorService.crear(createDto); }

  @Get()
  buscarTodos(
    @Query('skip') skip?: string, @Query('take') take?: string,
    @Query('contratoId') contratoId?: string, @Query('medidorId') medidorId?: string,
  ) {
    const where: any = {};
    if (contratoId) where.contratoId = BigInt(contratoId);
    if (medidorId) where.medidorId = BigInt(medidorId);
    return this.contratoMedidorService.buscarTodos({ skip: skip ? +skip : undefined, take: take ? +take : undefined, where });
  }

  @Get(':id')
  buscarUno(@Param('id') id: string) { return this.contratoMedidorService.buscarUno(BigInt(id)); }

  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() updateDto: ActualizarContratoMedidorDto) { return this.contratoMedidorService.actualizar(BigInt(id), updateDto); }

  @Post(':id/finalizar')
  finalizarVinculo(@Param('id') id: string, @Body('motivoCambio') motivoCambio?: string) { return this.contratoMedidorService.finalizarVinculo(BigInt(id), motivoCambio); }

  @Delete(':id')
  eliminar(@Param('id') id: string) { return this.contratoMedidorService.eliminar(BigInt(id)); }
}