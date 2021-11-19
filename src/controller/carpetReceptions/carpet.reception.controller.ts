/* eslint-disable prettier/prettier */

import { Body, Controller, Param, Post, SetMetadata, UseGuards } from "@nestjs/common";
import { AddCarpetReceptionDto } from "dto/CarpetReception/add.carpet.reception.dto";
import { EditCarpetReception } from "dto/CarpetReception/edit.carpet.reception.dto";
import { CarpetReception } from "entities/CarpetReception";
import { Clients } from "entities/Clients";
import { ApiResponse } from "src/misc/api.restonse";
import { RolleCheckerGard } from "src/rollecheckergard/rolle.checker.gatd";
import { CarpetReceptionsService } from "src/services/carpetReceprion/carpet.reception.service";

@Controller('api/carpetReception')

export class CarpetReceprionController {
    constructor(private readonly carpetReceptionService: CarpetReceptionsService) { }

    @Post('addReception/:id')
    @UseGuards(RolleCheckerGard)
    @SetMetadata('allow_to_roles', ['user'])
    async addReception(@Body() data: AddCarpetReceptionDto, @Param('id') workerId: number): Promise <Clients | ApiResponse> {
        return await this.carpetReceptionService.addCarpetReception(data, workerId)
    }

    @Post('editReception/:id/:userId')
    @UseGuards(RolleCheckerGard)
    @SetMetadata('allow_to_roles', ['user'])
    async editCarpetReception (@Body() data: EditCarpetReception, @Param('id') workerId: number, @Param('userId') userId: number):Promise <CarpetReception | ApiResponse> {
        return await this.carpetReceptionService.editCarpetReception(data, workerId, userId)
    }

    @Post('getAllReceptionsByClient/:id/:idUser')
    @UseGuards(RolleCheckerGard)
    @SetMetadata('allow_to_roles', ['user'])
    async getAllReceptionsByClient(@Param('id') clientsId: number, @Param('idUser') userId: number):Promise<CarpetReception[] | ApiResponse> {
        return await this.carpetReceptionService.getAllReceptionByuser(clientsId, userId)
    }

    @Post('getReceptionById/:id/:userId')
    @UseGuards(RolleCheckerGard)
    @SetMetadata('allow_to_roles', ['user'])
    async getReceptionById(@Param('id') Id: number, @Param('userId') userId: number):Promise<CarpetReception | ApiResponse> {
        return await this.carpetReceptionService.getReceptionById(Id, userId)
    }

    @Post('getBigistReceptionByUser/:id')
    @UseGuards(RolleCheckerGard)
    @SetMetadata('allow_to_roles', ['user'])
    async getBigistReceptionById(@Param('id') Id: number):Promise<CarpetReception[] | ApiResponse> {
        return await this.carpetReceptionService.getBigistReceptionForUser(Id);
    }
}