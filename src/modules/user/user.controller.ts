import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  ParseIntPipe,
  ForbiddenException,
} from '@nestjs/common';
import { CurrentUser } from 'src/shared/decorators/current-user.decorators';
import { Public } from 'src/shared/decorators/public.decorator';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { RoleCheckerGuard } from 'src/shared/guards/role-checker.guard';

import { AuthenticatedUser } from '../auth/types/jwt-payload.interface';

import { AddUserDto } from './dto/add-user.dto';
import { EditUserDto } from './dto/edit-user.dto';
import { User } from './user.entity';
import { UserService } from './user.service';

@Controller('users')
@UseGuards(RoleCheckerGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Public()
  async addUser(@Body() data: AddUserDto): Promise<User> {
    return await this.userService.addUser(data);
  }

  @Get('me')
  @Roles(Role.ADMINISTRATOR, Role.USER)
  async getMyProfile(@CurrentUser() user: AuthenticatedUser): Promise<User> {
    return await this.userService.getUserById(user.id);
  }

  @Put('me')
  @Roles(Role.ADMINISTRATOR, Role.USER)
  async editUser(@Body() data: EditUserDto, @CurrentUser() user: AuthenticatedUser): Promise<User> {
    return await this.userService.editUser(user.id, data);
  }

  @Delete('me')
  @Roles(Role.ADMINISTRATOR, Role.USER)
  async deleteUserHimself(@CurrentUser() user: AuthenticatedUser): Promise<void> {
    await this.userService.deleteUser(user.id);
  }

  @Get()
  @Roles(Role.ADMINISTRATOR)
  async getUsers(@Query('email') email?: string): Promise<User | User[] | null> {
    if (email) {
      return await this.userService.getUserByEmail(email);
    }
    return await this.userService.getAllUser();
  }

  @Get(':id')
  @Roles(Role.ADMINISTRATOR, Role.USER)
  async getUserById(
    @Param('id', ParseIntPipe) userId: number,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<User> {
    if (user.role !== Role.ADMINISTRATOR && user.id !== userId) {
      throw new ForbiddenException('You are not allowed to view other user profiles.');
    }
    return await this.userService.getUserById(userId);
  }

  @Delete(':id')
  @Roles(Role.ADMINISTRATOR)
  async deleteUserByAdministrator(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.userService.deleteUser(id);
  }
}
