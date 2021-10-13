/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, Param, Post, SetMetadata, UseGuards } from "@nestjs/common";
import { AddUserDto } from "dto/user/add.user.dto";
import { DeleteUserByAdminDto } from "dto/user/delete.user.by.admin.dto";
import { DeleteUserDto } from "dto/user/delete.user.dto";
import { EditUserDto } from "dto/user/edit.user.dto";
import { UserEmailDto } from "dto/user/user.emai.dto";
import { User } from "entities/User";
import { ApiResponse } from "src/misc/api.restonse";
import { RolleCheckerGard } from "src/rollecheckergard/rolle.checker.gatd";
import { UserService } from "src/services/user/user.service";

@Controller('api/user')

export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post('addUser')
    async addUser (@Body() data: AddUserDto):Promise <User | ApiResponse> {
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