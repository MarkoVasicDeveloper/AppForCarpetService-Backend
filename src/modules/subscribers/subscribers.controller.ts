import { Body, Controller, Get, Param, Post, SetMetadata, UseGuards } from '@nestjs/common';
import { AddSubscribersDto } from 'src/modules/subscribers/dto/add-subscribers.dto';
import { SubscibersService } from 'src/modules/subscribers/subscribers.service';
import { RoleCheckerGuard } from 'src/shared/guards/role-checker.guard';
import { ApiResponse } from 'src/shared/response/api-response';

import { Subscriber } from './subscriber.entity';

@Controller('api/subscriber')
export class SubscribersController {
  constructor(private readonly subscriberService: SubscibersService) {}

  @Post('add')
  @SetMetadata('allow_to_roles', ['user', 'administrator'])
  @UseGuards(RoleCheckerGuard)
  async addSubscriber(@Body() data: AddSubscribersDto): Promise<Subscriber | ApiResponse> {
    return await this.subscriberService.addSubscriber(data);
  }

  @Get('/:id')
  @SetMetadata('allow_to_roles', ['user', 'administrator'])
  @UseGuards(RoleCheckerGuard)
  async findByUserId(@Param('id') userId: number): Promise<Subscriber[]> {
    return await this.subscriberService.findByUserId(userId);
  }
}
