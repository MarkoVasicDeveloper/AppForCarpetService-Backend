/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, Param, Post, SetMetadata, UseGuards } from '@nestjs/common';
import { MailerDto } from 'src/modules/mailer/DTO/mailer.dto';
import { AddUserDto } from 'src/modules/user/DTO/add.user.dto';
import { DeleteUserByAdminDto } from 'src/modules/user/DTO/delete.user.by.admin.dto';
import { DeleteUserDto } from 'src/modules/user/DTO/delete.user.dto';
import { EditUserDto } from 'src/modules/user/DTO/edit.user.dto';
import { UserEmailDto } from 'src/modules/user/DTO/user.emai.dto';
import { User } from 'src/modules/user/user.entity';
import { ApiResponse } from 'src/misc/api.restonse';
import { RolleCheckerGard } from 'src/rollecheckergard/rolle.checker.gatd';
import { UserMailerService } from 'src/services/mailer/mailer.service';
import { UserService } from 'src/modules/user/user.service';

@Controller('api/user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly mailerService: UserMailerService,
  ) {}

  @Post('addUser')
  async addUser(@Body() data: AddUserDto): Promise<User | ApiResponse> {
    const conntent: MailerDto = new MailerDto();
    conntent.email = data.email;
    conntent.text = `<div style = 'text-align: center'>
                            <h1 style = "color: #fec400">Dobro dosli</h1>
                            <p style = 'margin-bottom: 1rem'>
                                Ovaj softver je besplatan i uvek ce biti!
                                Drago nam je da saradjujemo sa nekim ko se trudi da
                                unapredi svoje poslovanje!
                            </p> 
                            <p>
                                Klikom na ovaj link <a href = 'https://washersoftware.com/#/login'>
                                    Log In
                                </a> idete na stranucu za logovanje. Unesite vasu lozinku i email.
                                
                            </p>               
                        </div>`;
    await this.mailerService.sendEmail(conntent);
    return await this.userService.addUser(data);
  }

  @Post('editUser')
  @SetMetadata('allow_to_roles', ['administrator', 'user'])
  @UseGuards(RolleCheckerGard)
  async editUser(@Body() data: EditUserDto): Promise<User | ApiResponse> {
    return await this.userService.editUser(data);
  }

  @Delete('deleteUser')
  @SetMetadata('allow_to_roles', ['administrator', 'user'])
  @UseGuards(RolleCheckerGard)
  async deleteUser(@Body() data: DeleteUserDto): Promise<User | ApiResponse> {
    return await this.userService.deleteUserHimself(data);
  }

  @Delete('deleteUserByAdministrator')
  @SetMetadata('allow_to_roles', ['administrator'])
  @UseGuards(RolleCheckerGard)
  async deleteUserByAdministrator(@Body() data: DeleteUserByAdminDto): Promise<User | ApiResponse> {
    return await this.userService.deleteUserByAdministrator(data);
  }

  @Get('getAllUser')
  @SetMetadata('allow_to_roles', ['administrator'])
  @UseGuards(RolleCheckerGard)
  async getAllUser(): Promise<User[]> {
    return await this.userService.getAllUser();
  }

  @Post('getUserByEmail')
  @SetMetadata('allow_to_roles', ['administrator'])
  @UseGuards(RolleCheckerGard)
  async getUserByEmail(@Body() data: UserEmailDto): Promise<User | ApiResponse> {
    return await this.userService.getUserByEmail(data);
  }

  @Post('getUserById/:id')
  @SetMetadata('allow_to_roles', ['administrator', 'user'])
  @UseGuards(RolleCheckerGard)
  async getUserById(@Param('id') userId: number): Promise<User | ApiResponse> {
    return await this.userService.getUserById(userId);
  }
}
