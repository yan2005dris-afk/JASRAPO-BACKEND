import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RequiredPermission } from 'src/common/decorators/require-permission.decorator';
import { CurrentUser } from 'src/identity/auth/interfaces/http/decorators/current-user.decorator';
import type { JwtPayload } from 'src/identity/auth/application/types/jwt.types';
import { PrismaCashSessionRepository } from '../../infrastructure/repositories/prisma-cash-session.repository';
import {
  OpenCashSessionDto,
  CreateCashMovementDto,
  CloseCashSessionDto,
} from '../dto/cash-session.dto';

@ApiTags('Cash Sessions / Arqueo de Caja')
@ApiBearerAuth()
@Controller('cash-sessions')
export class CashSessionsController {
  constructor(
    private readonly cashSessionRepository: PrismaCashSessionRepository,
  ) {}

  @Get('current')
  @RequiredPermission('payments', 'read')
  @ApiOperation({ summary: 'Obtiene la sesión de caja activa del usuario' })
  async getCurrent(@CurrentUser() user?: JwtPayload) {
    const email = user?.email || (user?.sub ? `user_${user.sub}` : undefined);
    return this.cashSessionRepository.getCurrentSession(email);
  }

  @Post('open')
  @RequiredPermission('payments', 'create')
  @ApiOperation({ summary: 'Abre una nueva sesión de caja diaria' })
  async open(
    @Body() dto: OpenCashSessionDto,
    @CurrentUser() user?: JwtPayload,
  ) {
    const email =
      user?.email || (user?.sub ? `user_${user.sub}` : 'admin@jasrapo.com');
    return this.cashSessionRepository.openSession(dto, email);
  }

  @Post(':id/movements')
  @RequiredPermission('payments', 'create')
  @ApiOperation({
    summary: 'Registra un gasto menor / egreso en la caja activa',
  })
  async addMovement(
    @Param('id') id: string,
    @Body() dto: CreateCashMovementDto,
    @CurrentUser() user?: JwtPayload,
  ) {
    const email =
      user?.email || (user?.sub ? `user_${user.sub}` : 'admin@jasrapo.com');
    return this.cashSessionRepository.addMovement(BigInt(id), dto, email);
  }

  @Post(':id/close')
  @RequiredPermission('payments', 'update')
  @ApiOperation({
    summary: 'Cierra la sesión de caja con arqueo físico y reporte',
  })
  async close(
    @Param('id') id: string,
    @Body() dto: CloseCashSessionDto,
    @CurrentUser() user?: JwtPayload,
  ) {
    const email =
      user?.email || (user?.sub ? `user_${user.sub}` : 'admin@jasrapo.com');
    return this.cashSessionRepository.closeSession(BigInt(id), dto, email);
  }

  @Get('history')
  @RequiredPermission('payments', 'read')
  @ApiOperation({ summary: 'Historial de sesiones y arqueos de caja' })
  async getHistory(
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ) {
    return this.cashSessionRepository.getHistory(
      limit ? Number(limit) : 20,
      page ? Number(page) : 1,
    );
  }
}
