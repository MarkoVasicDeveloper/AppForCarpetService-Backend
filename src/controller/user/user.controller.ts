/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, Post } from "@nestjs/common";
import { AddUserDto } from "dto/user/add.user.dto";
import { DeleteUserByAdminDto } from "dto/user/delete.user.by.admin.dto";
import { DeleteUserDto } from "dto/user/delete.user.dto";
import { EditUserDto } from "dto/user/edit.user.dto";
import { UserEmailDto } from "dto/user/user.emai.dto";
import { User } from "entities/User";
import { ApiResponse } from "misc/api.restonse";
import { UserService } from "src/services/user/user.service";

@Controller('api/user')

export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post('addUser')
    async addUser (@Body() data: AddUserDto):Promise <User | ApiResponse> {
        return await this.userService.addUser(data)
    }

    @Post('editUser')
    async editUser (@Body() data: EditUserDto):Promise <User | ApiResponse> {
        return await this.userService.editUser(data)
    }

    @Delete('deleteUser')
    async deleteUser (@Body() data: DeleteUserDto): Promise <User | ApiResponse> {
        return await this.userService.deleteUserHimself(data)
    }

    @Delete('deleteUserByAdministrator')
    async deleteUserByAdministrator (@Body() data: DeleteUserByAdminDto): Promise <User | ApiResponse> {
        return await this.userService.deleteUserByAdministrator(data)
    }

    @Get('getAllUser')
    async getAllUser (): Promise <User[]> {
        return await this.userService.getAllUser()
    }

    @Post('getUserByEmail')
    async getUserByEmail (@Body() data: UserEmailDto): Promise <User | ApiResponse> {
        return await this.userService.getUserByEmail(data)
    }
}