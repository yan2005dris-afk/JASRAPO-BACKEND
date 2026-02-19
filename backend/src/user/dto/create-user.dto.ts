import { IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  userEmail: string;
  @IsString()
  userName?: string;
  @IsString()
  userPassword: string;
}
