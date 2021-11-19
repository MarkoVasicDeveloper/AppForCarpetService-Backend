/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Param, Post, SetMetadata, UseGuards } from "@nestjs/common";
import { EditSchedulingCarpetDto } from "dto/SchedulingCarpet/edit.scheduling.carpet.dto";
import { SchedulingCarpetDto } from "dto/SchedulingCarpet/Scheduling.carpet.dto";
import { SchedulingCarpet } from "entities/SchedulingCarpet";
import { ApiResponse } from "src/misc/api.restonse";
import { RolleCheckerGard } from "src/rollecheckergard/rolle.checker.gatd";
import SchadulingCarpetService from "src/services/SchedulingCarpet/SchedulingCarpet";

@Controller('api/schedulingCarpet')

export default class SchedulingCarpetController {
    constructor(private readonly schedulingCarpetService: SchadulingCarpetService) {}

    @Post('add/:id')
    @UseGuards(RolleCheckerGard)
    @SetMetadata('allow_to_roles', ['user'])
    async addSchedulingCarpet (@Body() data: SchedulingCarpetDto, @Param('id') userId: number):Promise <SchedulingCarpet> {
        return await this.schedulingCarpetService.addSchedulingCarpet(data,userId)
    }

    @Post('edit/:id')
    @UseGuards(RolleCheckerGard)
    @SetMetadata('allow_to_roles', ['user'])
    async editSchedulingCarpet (@Body() data: EditSchedulingCarpetDto, @Param('id') userId: number):Promise <SchedulingCarpet | ApiResponse> {
        return await this.schedulingCarpetService.editSchedulingCarpet(data,userId);
    }

    @Get('getAll/:id')
    @UseGuards(RolleCheckerGard)
    @SetMetadata('allow_to_roles', ['user'])
    async getAll(@Param('id') userId: number):Promise<SchedulingCarpet[]>{
        return await this.schedulingCarpetService.getAllScheduling(userId);
    }
}