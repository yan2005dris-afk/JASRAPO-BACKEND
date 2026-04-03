import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { MedidoresService } from './medidor.service';
import { CrearMedidorDto } from './dto/create-medidor.dto';
import { ActualizarMedidorDto } from './dto/update-medidor.dto';

@Controller('medidores')
export class MedidoresController {
  constructor(private readonly medidoresService: MedidoresService) {}

  @Post('crearMedidor')
  crear(@Body() createDto: CrearMedidorDto) { return this.medidoresService.crearMedidor(createDto); }

  @Get('buscarMedidores')
  buscarTodos(@Query('skip') skip?: string, @Query('take') take?: string) 
  {
    return this.medidoresService.buscarMedidores({ skip: skip ? +skip : undefined, take: take ? +take : undefined });
  }

  @Get('buscarMedidor/:id')
  buscarUno(@Param('id') id: string) { return this.medidoresService.buscarMedidor(BigInt(id)); }

  @Patch('actualizarMedidor/:id')
  actualizar(@Param('id') id: string, @Body() updateDto: ActualizarMedidorDto) { return this.medidoresService.actualizarMedidor(BigInt(id), updateDto); }

  @Delete('eliminarMedidor/:id')
  eliminar(@Param('id') id: string) { return this.medidoresService.eliminarMedidor(BigInt(id)); }

  @Post('instalarMedidor/:id')
  instalar(@Param('id') id: string, @Body('contratoId') contratoId: string) { return this.medidoresService.instalarMedidor(BigInt(id), BigInt(contratoId)); }

  @Post('reportarDano/:id')
  reportarDano(@Param('id') id: string) { return this.medidoresService.reportarDano(BigInt(id)); }

  @Post('facturar-promedio/:id')
  facturarPorPromedio(@Param('id') id: string) { return this.medidoresService.facturarPorPromedio(BigInt(id)); }

  @Post('dar-de-baja/:id')
  darDeBaja(@Param('id') id: string, @Body('motivoBaja') motivoBaja: string) { return this.medidoresService.darDeBaja(BigInt(id), motivoBaja); }
}