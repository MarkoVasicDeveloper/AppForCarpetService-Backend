/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, Post } from "@nestjs/common";
import { AddAdministratorDto } from "dto/administrator/add.administrator.dto";
import { DeleteAdministratorDto } from "dto/administrator/delete.administrator.dto";
import { EditAdministratorDto } from "dto/administrator/edit.administrator.dto";
import { UsernameAdministratorDto } from "dto/administrator/username.administrator.dto";
import { Administrator } from "entities/Administrator";
import { ApiResponse } from "misc/api.restonse";
import { AdministratorService } from "src/services/administrator/administrator.service";

@Controller('api/administrator')

export class AdministratorController {
    constructor(private readonly administratorService: AdministratorService) { }

    @Post('add')
    async addAdministrator (@Body() data: AddAdministratorDto): Promise <Administrator | ApiResponse> {
        return await this.administratorService.addAdministrator(data)
    }

    @Post('edit')
    async editAdmin (@Body() data: EditAdministratorDto): Promise <Administrator | ApiResponse> {
        return await this.administratorService.editAdmin(data)
    }

    @Delete('delete')
    async deleteAdmin (@Body() data: DeleteAdministratorDto): Promise <Administrator | ApiResponse> {
        return await this.administratorService.deleteAdmin(data)
    }

    @Get('allAdmin')
    async getAllAdmin ():Promise <Administrator[]> {
        return await this.administratorService.getAllAdmin()
    }

    @Post('getAdminByUsername')
    async getAdminByUsername (@Body() data: UsernameAdministratorDto): Promise <Administrator | ApiResponse> {
        return await this.administratorService.getAdminByUsername(data)
    }
}