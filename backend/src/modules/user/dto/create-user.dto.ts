import { Type } from 'class-transformer';

import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateUserDto {
  email: string;
  password: string;
}
