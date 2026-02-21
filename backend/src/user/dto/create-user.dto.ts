import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateUserDto {
  userEmail: string;
  userName: string;
  userPassword: string;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  perfilId:number;
}
