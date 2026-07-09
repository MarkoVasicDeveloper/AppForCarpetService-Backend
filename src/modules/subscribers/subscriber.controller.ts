import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { Subscriber } from 'src/modules/subscribers/subscriber.entity';
import { CurrentOwnerId } from 'src/shared/decorators/current-owner-id.decorator';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { RoleCheckerGuard } from 'src/shared/guards/role-checker.guard';

import { AddSubscriberDto } from './dto/add-subscriber.dto';
import { EditSubscriberDto } from './dto/edit-subscriber.dto';
import { SubscriberService } from './subscriber.service';

@Controller('subscribers')
@UseGuards(RoleCheckerGuard)
@Roles(Role.ADMINISTRATOR)
export class SubscriberController {
  constructor(private readonly subscriberService: SubscriberService) {}

  @Post()
  async addSubscriber(
    @CurrentOwnerId() userId: number,
    @Body() data: AddSubscriberDto,
  ): Promise<Subscriber> {
    return await this.subscriberService.addSubscriber(userId, data);
  }

  @Patch(':subscriberId')
  async editSubscriber(
    @CurrentOwnerId() userId: number,
    @Param('subscriberId', ParseIntPipe) subscriberId: number,
    @Body() data: EditSubscriberDto,
  ): Promise<Subscriber> {
    return await this.subscriberService.editSubscriber(subscriberId, userId, data);
  }

  @Get()
  @Roles(Role.USER)
  async getMySubscriptions(@CurrentOwnerId() userId: number): Promise<Subscriber[]> {
    return await this.subscriberService.findByUserId(userId);
  }

  @Get('admin/all')
  @Roles(Role.USER)
  async getAllSubscribersForAdmin(): Promise<Subscriber[]> {
    return await this.subscriberService.findAllForAdmin();
  }
}
