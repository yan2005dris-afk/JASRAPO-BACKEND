import { ApiProperty } from '@nestjs/swagger';

export class InvitationPreviewDto {
  @ApiProperty({
    description: 'Email del usuario invitado',
    example: 'usuario@jasrapo.com',
  })
  email: string;

  @ApiProperty({
    description: 'Nombre del usuario invitado',
    example: 'Juan',
  })
  nombres: string | null;

  @ApiProperty({
    description: 'Apellido del usuario invitado',
    example: 'Pérez',
  })
  apellidos: string | null;

  @ApiProperty({
    description: 'Fecha de expiración de la invitación',
    example: '2026-08-22T10:30:00Z',
  })
  expiresAt: Date;

  @ApiProperty({
    description: 'Si la invitación ya fue aceptada',
    example: false,
  })
  isAccepted: boolean;
}
