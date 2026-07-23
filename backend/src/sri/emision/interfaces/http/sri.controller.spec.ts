jest.mock('pg-boss', () => ({
  PgBoss: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    send: jest.fn(),
    work: jest.fn(),
    getQueueSize: jest.fn().mockResolvedValue(0),
  })),
}));

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import {
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { SriController } from './sri.controller';
import { SriService } from '../../application/services/sri.service';
import { EmitirComprobanteManualUseCase } from '../../application/use-cases/emitir-comprobante-manual.use-case';
import type { JwtPayload } from '../../../../identity/auth/interfaces/dto/auth.dto';
import { UserRole } from '../../../../identity/auth/interfaces/dto/auth.dto';
import { EmisoresService } from '../../../emisores/application/emisores.service';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../../../../infrastructure/observability/logger/logger.service';

describe('SriController — emitirManual', () => {
  let controller: SriController;
  let emitirComprobanteManual: jest.Mocked<
    Pick<EmitirComprobanteManualUseCase, 'execute'>
  >;

  const CLAVE = '1234567890123456789012345678901234567890123456789';
  const SRI_USER: JwtPayload = {
    sub: 7,
    sid: 'test-session-id',
    email: 'sri-admin@example.com',
    rol: UserRole.ADMIN, // exact role is enforced by the @RequiredPermission guard,
    //                        not by the controller method itself.
    tokenVersion: 0,
  };

  // Minimal Express request stub: only the fields emitirManual reads.
  const REQ = {
    ip: '10.0.0.9',
    socket: { remoteAddress: '10.0.0.9' },
    headers: { 'user-agent': 'jest-agent/1.0' },
  } as any;

  beforeEach(async () => {
    emitirComprobanteManual = {
      execute: jest.fn(),
    };

    const mockLogger = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SriController],
      providers: [
        {
          provide: SriService,
          useValue: Object.assign(Object.create(SriService.prototype), {}),
        },
        {
          provide: EmisoresService,
          useValue: { validateRucAccess: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn() },
        },
        {
          provide: LoggerService,
          useValue: mockLogger,
        },
        {
          provide: EmitirComprobanteManualUseCase,
          useValue: emitirComprobanteManual,
        },
      ],
    }).compile();

    controller = module.get(SriController);
  });

  it('R-7/S1: delegates to use case with current user + claveAcceso; returns outcome', async () => {
    emitirComprobanteManual.execute.mockResolvedValue('EMITTED');

    const result = await controller.emitirManual(CLAVE, SRI_USER, REQ);

    expect(result).toBe('EMITTED');
    expect(emitirComprobanteManual.execute).toHaveBeenCalledWith(
      CLAVE,
      expect.objectContaining({
        id: 7,
        email: 'sri-admin@example.com',
        ip: '10.0.0.9',
        userAgent: 'jest-agent/1.0',
      }),
    );
  });

  it('R-7/S2: 409 ConflictException from use case propagates to caller', async () => {
    emitirComprobanteManual.execute.mockRejectedValue(
      new ConflictException('Comprobante en estado AUTORIZADO no es elegible'),
    );

    await expect(
      controller.emitirManual(CLAVE, SRI_USER, REQ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('R-7/S4: 404 NotFoundException from use case propagates to caller', async () => {
    emitirComprobanteManual.execute.mockRejectedValue(
      new NotFoundException(`Comprobante ${CLAVE} no encontrado`),
    );

    await expect(
      controller.emitirManual(CLAVE, SRI_USER, REQ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('other errors propagate unchanged', async () => {
    emitirComprobanteManual.execute.mockRejectedValue(
      new ForbiddenException('forbidden'),
    );

    await expect(
      controller.emitirManual(CLAVE, SRI_USER, REQ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
