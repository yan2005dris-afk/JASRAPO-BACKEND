import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({ example: 'users' })
  @IsString()
  @IsNotEmpty()
  resource: string;

  @ApiProperty({ example: 'read' })
  @IsString()
  @IsNotEmpty()
  action: string;
}
