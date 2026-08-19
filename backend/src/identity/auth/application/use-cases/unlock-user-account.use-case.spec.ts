jest.mock('pg-boss', () => ({
  PgBoss: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    start: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn().mockResolvedValue(undefined),
    createQueue: jest.fn().mockResolvedValue(undefined),
    send: jest.fn().mockResolvedValue('job-id'),
    insert: jest.fn().mockResolvedValue(['job-id']),
    work: jest.fn().mockResolvedValue(undefined),
  })),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { UnlockUserAccountUseCase } from './unlock-user-account.use-case';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { AuditService } from 'src/infrastructure/audit/audit.service';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

describe('UnlockUserAccountUseCase', () => {
  let useCase: UnlockUserAccountUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let auditService: jest.Mocked<AuditService>;

  beforeEach(async () => {
    const mockUserRepo = {
      findByEmail: jest.fn(),
      clearFailedLoginAttempts: jest.fn(),
    };

    const mockAuditService = {
      log: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnlockUserAccountUseCase,
        { provide: UserRepository, useValue: mockUserRepo },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    useCase = module.get<UnlockUserAccountUseCase>(UnlockUserAccountUseCase);
    userRepository = module.get(UserRepository);
    auditService = module.get(AuditService);
  });

  it('should unlock an existing locked user and write an audit record', async () => {
    userRepository.findByEmail.mockResolvedValue({
      usuarioId: 42,
      email: 'test@jasrapo.gob.ec',
      deletedAt: null,
    } as any);

    const result = await useCase.execute(
      { email: 'test@jasrapo.gob.ec', motivo: 'Desbloqueo solicitado' },
      1,
    );

    expect(result).toEqual({
      usuarioId: 42,
      email: 'test@jasrapo.gob.ec',
      unlockedBy: 1,
      unlockedAt: expect.any(String),
      mensaje: 'Cuenta desbloqueada exitosamente',
    });

    expect(userRepository.clearFailedLoginAttempts).toHaveBeenCalledWith(42);
    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        usuarioId: 1,
        accion: 'auth.account.unlock',
        recurso: 'usuarios',
        recursoId: '42',
        exitoso: true,
        metadata: expect.objectContaining({
          targetUsuarioId: 42,
          targetEmail: 'test@jasrapo.gob.ec',
          adminUsuarioId: 1,
          motivo: 'Desbloqueo solicitado',
        }),
      }),
    );
  });

  it('should throw EntityNotFoundException if email does not exist', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({ email: 'nonexistent@jasrapo.gob.ec' }, 1),
    ).rejects.toThrow(EntityNotFoundException);

    expect(userRepository.clearFailedLoginAttempts).not.toHaveBeenCalled();
    expect(auditService.log).not.toHaveBeenCalled();
  });

  it('should throw EntityNotFoundException if user is soft-deleted', async () => {
    userRepository.findByEmail.mockResolvedValue({
      usuarioId: 42,
      email: 'deleted@jasrapo.gob.ec',
      deletedAt: new Date(),
    } as any);

    await expect(
      useCase.execute({ email: 'deleted@jasrapo.gob.ec' }, 1),
    ).rejects.toThrow(EntityNotFoundException);

    expect(userRepository.clearFailedLoginAttempts).not.toHaveBeenCalled();
    expect(auditService.log).not.toHaveBeenCalled();
  });
});
