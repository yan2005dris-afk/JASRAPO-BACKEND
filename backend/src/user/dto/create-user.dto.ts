
import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsNumber, IsString, Matches, MinLength } from 'class-validator';

export class CreateUserDto {
  userEmail: string;
  userName?: string;
  userPassword: string;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  perfilId:number;
}
