import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { AuditService } from 'src/infrastructure/audit/audit.service';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';
import { UnlockAccountDto, UnlockAccountResponseDto } from '../../interfaces/dto/unlock-account.dto';

@Injectable()
export class UnlockUserAccountUseCase {
  private readonly logger = new Logger(UnlockUserAccountUseCase.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    dto: UnlockAccountDto,
    adminUsuarioId: number,
  ): Promise<UnlockAccountResponseDto> {
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user || user.deletedAt !== null) {
      throw new EntityNotFoundException('Usuario', dto.email);
    }

    const now = new Date();

    // Unlock in DB
    await this.userRepository.clearFailedLoginAttempts(user.usuarioId);

    // Audit log
    await this.auditService.log({
      usuarioId: adminUsuarioId,
      accion: 'auth.account.unlock',
      recurso: 'usuarios',
      recursoId: user.usuarioId.toString(),
      descripcion: `Desbloqueo administrativo de cuenta para ${dto.email}`,
      exitoso: true,
      metadata: {
        targetUsuarioId: user.usuarioId,
        targetEmail: dto.email,
        adminUsuarioId,
        motivo: dto.motivo || 'Desbloqueo administrativo por superusuario/admin',
        timestamp: now.toISOString(),
      },
    });

    this.logger.log(
      `Usuario ${user.usuarioId} (${user.email}) desbloqueado por admin ${adminUsuarioId}. Motivo: ${dto.motivo || 'N/A'}`,
    );

    return {
      usuarioId: user.usuarioId,
      email: user.email,
      unlockedBy: adminUsuarioId,
      unlockedAt: now.toISOString(),
      mensaje: 'Cuenta desbloqueada exitosamente',
    };
  }
}
