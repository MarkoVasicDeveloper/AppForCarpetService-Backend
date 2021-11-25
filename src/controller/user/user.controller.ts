/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, Param, Post, SetMetadata, UseGuards } from "@nestjs/common";
import { MailerDto } from "dto/mailer/mailer.dto";
import { AddUserDto } from "dto/user/add.user.dto";
import { DeleteUserByAdminDto } from "dto/user/delete.user.by.admin.dto";
import { DeleteUserDto } from "dto/user/delete.user.dto";
import { EditUserDto } from "dto/user/edit.user.dto";
import { UserEmailDto } from "dto/user/user.emai.dto";
import { User } from "entities/User";
import { ApiResponse } from "src/misc/api.restonse";
import { RolleCheckerGard } from "src/rollecheckergard/rolle.checker.gatd";
import { UserMailerService } from "src/services/mailer/mailer.service";
import { UserService } from "src/services/user/user.service";

@Controller('api/user')

export class UserController {
    constructor(private readonly userService: UserService,
                private readonly mailerService: UserMailerService) {}

    @Post('addUser')
    async addUser (@Body() data: AddUserDto):Promise <User | ApiResponse> {
        const conntent: MailerDto = new MailerDto();
        conntent.email = data.email;
        conntent.text = `<div style = 'text-align: center'>
                            <h1 style = "color: #fec400">Dobro dosli</h1>
                            <p style = 'margin-bottom: 1rem'>
                                Poklanjamo Vam 15 dana besplatnog koriscenja sofrvera
                                u zelji da se sto bolje upoznate sa prednostima koje
                                koriscenje Washer softvera donosi za Vas posao.
                                Drago nam je da saradjujemo sa nekim ko se trudi da
                                unapredi svoj posao!
                            </p> 
                            <p>
                                Klikom na ovaj link <a href = 'http://localhost:4000/#/login'>
                                    Log In
                                </a> idete na stranucu za logovanje. Unesite vasu lozinku i email.
                                
                            </p>               
                        </div>`
        await this.mailerService.sendEmail(conntent)
        return await this.userService.addUser(data)
    }

    @Post('editUser')
    @SetMetadata('allow_to_roles', ['administrator', 'user'])
    @UseGuards(RolleCheckerGard)
    async editUser (@Body() data: EditUserDto):Promise <User | ApiResponse> {
        return await this.userService.editUser(data)
    }

    @Delete('deleteUser')
    @SetMetadata('allow_to_roles', ['administrator', 'user'])
    @UseGuards(RolleCheckerGard)
    async deleteUser (@Body() data: DeleteUserDto): Promise <User | ApiResponse> {
        return await this.userService.deleteUserHimself(data)
    }

    @Delete('deleteUserByAdministrator')
    @SetMetadata('allow_to_roles', ['administrator'])
    @UseGuards(RolleCheckerGard)
    async deleteUserByAdministrator (@Body() data: DeleteUserByAdminDto): Promise <User | ApiResponse> {
        return await this.userService.deleteUserByAdministrator(data)
    }

    @Get('getAllUser')
    @SetMetadata('allow_to_roles', ['administrator'])
    @UseGuards(RolleCheckerGard)
    async getAllUser (): Promise <User[]> {
        return await this.userService.getAllUser()
    }

    @Post('getUserByEmail')
    @SetMetadata('allow_to_roles', ['administrator'])
    @UseGuards(RolleCheckerGard)
    async getUserByEmail (@Body() data: UserEmailDto): Promise <User | ApiResponse> {
        return await this.userService.getUserByEmail(data)
    }

    @Post('getUserById/:id')
    @SetMetadata('allow_to_roles', ['administrator', 'user'])
    @UseGuards(RolleCheckerGard)
    async getUserById (@Param('id') userId: number): Promise <User | ApiResponse> {
        return await this.userService.getUserById(userId)
    }
}