/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Param, Post, SetMetadata, UseGuards } from "@nestjs/common";
import { AddSubscribersDto } from "dto/Subscribers/add.subscribers.dto";
import { Subscribers } from "entities/Subscribers";
import { ApiResponse } from "src/misc/api.restonse";
import { RolleCheckerGard } from "src/rollecheckergard/rolle.checker.gatd";
import { SubscibersService } from "src/services/subscribers/subscribers.service";

@Controller('api/subscriber')

export class SubscribersController {
    constructor(private readonly subscriberService: SubscibersService) {}

    @Post('add')
    @SetMetadata('allow_to_roles', ['administrator'])
    @UseGuards(RolleCheckerGard)
    async addSubscriber(@Body() data: AddSubscribersDto):Promise <Subscribers | ApiResponse> {
        return await this.subscriberService.addSubscriber(data)
    }

    @Get('/:id')
    @SetMetadata('allow_to_roles', ['administrator'])
    @UseGuards(RolleCheckerGard)
    async findByUserId(@Param('id') userId: number):Promise <Subscribers[]> {
        return await this.subscriberService.findByUserId(userId)
    }
}