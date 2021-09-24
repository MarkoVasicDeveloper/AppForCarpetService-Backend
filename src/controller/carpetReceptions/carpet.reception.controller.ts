/* eslint-disable prettier/prettier */

import { Body, Controller, Post, SetMetadata, UseGuards } from "@nestjs/common";
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

    @Post('addReception')
    @UseGuards(RolleCheckerGard)
    @SetMetadata('allow_to_roles', ['user'])
    async addReception(@Body() data: AddCarpetReceptionDto): Promise <Clients | ApiResponse> {
        return await this.carpetReceptionService.addCarpetReception(data)
    }

    @Post('editReception')
    @UseGuards(RolleCheckerGard)
    @SetMetadata('allow_to_roles', ['user'])
    async editCarpetReception (@Body() data: EditCarpetReception):Promise <CarpetReception | ApiResponse> {
        return await this.carpetReceptionService.editCarpetReception(data)
    }
}