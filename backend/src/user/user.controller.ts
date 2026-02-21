import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser({
      email: createUserDto.email,
      password: createUserDto.password,
      usersRolesId: createUserDto.usersRolesId,
    });
  }

  @Get('/')
  findAll(@Query('skip') skip?: number, @Query('take') take?: number) {
    return this.userService.users({
      skip: skip ?? undefined,
      take: take ?? undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.user({ usersId: id });
  }

  /**
   * TODO revisar el updateUser en el user.service.ts, porque o si deberia actualizar directamente un userRoles o si deberia actualizar el user y luego actualizar el userRoles, porque en el DTO de updateUser no se incluye el usersRolesId, entonces no se puede actualizar el userRoles directamente desde el updateUser, entonces revisar si se debe incluir el usersRolesId en el DTO de updateUser o si se debe crear un endpoint separado para actualizar el userRoles, o si se debe actualizar el user y luego actualizar el userRoles en el mismo endpoint, revisar cual es la mejor opción para mantener la integridad de los datos y la simplicidad del código.
   */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser({
      where: { usersId: id },
      data: {
        email: updateUserDto.email,
        password: updateUserDto.password,
      },
    });
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.deleteUser({ usersId: id });
  }
}
