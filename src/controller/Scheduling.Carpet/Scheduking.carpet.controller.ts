/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Post, SetMetadata, UseGuards } from "@nestjs/common";
import { EditSchedulingCarpetDto } from "dto/SchedulingCarpet/edit.scheduling.carpet.dto";
import { SchedulingCarpetDto } from "dto/SchedulingCarpet/Scheduling.carpet.dto";
import { SchedulingCarpet } from "entities/SchedulingCarpet";
import { ApiResponse } from "src/misc/api.restonse";
import { RolleCheckerGard } from "src/rollecheckergard/rolle.checker.gatd";
import SchadulingCarpetService from "src/services/SchedulingCarpet/SchedulingCarpet";

@Controller('api/schedulingCarpet')

export default class SchedulingCarpetController {
    constructor(private readonly schedulingCarpetService: SchadulingCarpetService) {}

    @Post('add')
    @UseGuards(RolleCheckerGard)
    @SetMetadata('allow_to_roles', ['user'])
    async addSchedulingCarpet (@Body() data: SchedulingCarpetDto):Promise <SchedulingCarpet> {
        return await this.schedulingCarpetService.addSchedulingCarpet(data)
    }

    @Post('edit')
    @UseGuards(RolleCheckerGard)
    @SetMetadata('allow_to_roles', ['user'])
    async editSchedulingCarpet (@Body() data: EditSchedulingCarpetDto):Promise <SchedulingCarpet | ApiResponse> {
        return await this.schedulingCarpetService.editSchedulingCarpet(data);
    }

    @Get('getAll')
    @UseGuards(RolleCheckerGard)
    @SetMetadata('allow_to_roles', ['user'])
    async getAll():Promise<SchedulingCarpet[]>{
        return await this.schedulingCarpetService.getAllScheduling();
    }
}