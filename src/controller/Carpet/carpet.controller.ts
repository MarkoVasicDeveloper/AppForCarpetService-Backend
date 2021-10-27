/* eslint-disable prettier/prettier */
import { Body, Controller, Param, Post, SetMetadata, UseGuards } from "@nestjs/common";
import { AddCarpetDto } from "dto/Carpet/add.carpet.dto";
import { DateCarpetDto } from "dto/Carpet/date.carpet.dto";
import { Carpet } from "entities/Carpet";
import { ApiResponse } from "src/misc/api.restonse";
import { RolleCheckerGard } from "src/rollecheckergard/rolle.checker.gatd";
import { CarpetService } from "src/services/Carpet/carpet.service";

@Controller('api/carpet')

export class CarpetController{
    constructor(private readonly carpetService: CarpetService) {}

    @Post('addCarpet')
    @UseGuards(RolleCheckerGard)
    @SetMetadata('allow_to_roles', ['user'])
    async addCarpet (@Body() data: AddCarpetDto):Promise<Carpet | ApiResponse> {
        return await this.carpetService.addCarpet(data)
    }

    @Post('editCarpet/:id')
    @UseGuards(RolleCheckerGard)
    @SetMetadata('allow_to_roles', ['user'])
    async editCarpet (@Body() data: AddCarpetDto, @Param('id') carpetId: number):Promise<Carpet | ApiResponse> {
        return await this.carpetService.editCarpet(data, carpetId);
    }
    
    @Post('getCarpetByDate')
    @UseGuards(RolleCheckerGard)
    @SetMetadata('allow_to_roles', ['user'])
    async getCarpetByDate(@Body() data: DateCarpetDto):Promise <Carpet[] | ApiResponse> {
        return await this.carpetService.getAllCarpetByDate(data)
    }
}