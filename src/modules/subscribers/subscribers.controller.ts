/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Param, Post, SetMetadata, UseGuards } from '@nestjs/common';
import { AddSubscribersDto } from 'src/modules/subscribers/DTO/add.subscribers.dto';
import { Subscribers } from 'entities/Subscribers';
import { ApiResponse } from 'src/misc/api.restonse';
import { RolleCheckerGard } from 'src/rollecheckergard/rolle.checker.gatd';
import { SubscibersService } from 'src/modules/subscribers/subscribers.service';

@Controller('api/subscriber')
export class SubscribersController {
  constructor(private readonly subscriberService: SubscibersService) {}

  @Post('add')
  @SetMetadata('allow_to_roles', ['user', 'administrator'])
  @UseGuards(RolleCheckerGard)
  async addSubscriber(@Body() data: AddSubscribersDto): Promise<Subscribers | ApiResponse> {
    return await this.subscriberService.addSubscriber(data);
  }

  @Get('/:id')
  @SetMetadata('allow_to_roles', ['user', 'administrator'])
  @UseGuards(RolleCheckerGard)
  async findByUserId(@Param('id') userId: number): Promise<Subscribers[]> {
    return await this.subscriberService.findByUserId(userId);
  }
}
