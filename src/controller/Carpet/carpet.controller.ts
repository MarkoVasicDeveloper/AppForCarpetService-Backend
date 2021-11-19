/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Param, Post, SetMetadata, UseGuards } from "@nestjs/common";
import { AddCarpetDto } from "dto/Carpet/add.carpet.dto";
import { DateCarpetDto } from "dto/Carpet/date.carpet.dto";
import { Carpet } from "entities/Carpet";
import { ApiResponse } from "src/misc/api.restonse";
import { RolleCheckerGard } from "src/rollecheckergard/rolle.checker.gatd";
import { CarpetService } from "src/services/Carpet/carpet.service";

@Controller('api/carpet')

export class CarpetController{
    constructor(private readonly carpetService: CarpetService) {}

    @Post('addCarpet/:userId')
    @UseGuards(RolleCheckerGard)
    @SetMetadata('allow_to_roles', ['user'])
    async addCarpet (@Body() data: AddCarpetDto, @Param('userId') userId: number):Promise<Carpet | ApiResponse> {
        return await this.carpetService.addCarpet(data, userId)
    }

    @Post('editCarpet/:id/:userId')
    @UseGuards(RolleCheckerGard)
    @SetMetadata('allow_to_roles', ['user'])
    async editCarpet (@Body() data: AddCarpetDto, @Param('id') carpetId: number, @Param('userId') userId: number):Promise<Carpet | ApiResponse> {
        return await this.carpetService.editCarpet(data, carpetId, userId);
    }
    
    @Post('getCarpetByDate/:userId')
    @UseGuards(RolleCheckerGard)
    @SetMetadata('allow_to_roles', ['user'])
    async getCarpetByDate(@Body() data: DateCarpetDto, @Param('userId') userId: number):Promise <Carpet[] | ApiResponse> {
        return await this.carpetService.getAllCarpetByDate(data, userId)
    }

    @Get('getAllCarpetByClientId/:receptionId/:userId')
    @UseGuards(RolleCheckerGard)
    @SetMetadata('allow_to_roles', ['user'])
    async getAllCarpetByClientId(@Param('userId') userId: number, @Param('receptionId') receptionId: number):Promise <Carpet[] | ApiResponse> {
        return await this.carpetService.getAllCarpetByClientId(receptionId, userId)
    }
}