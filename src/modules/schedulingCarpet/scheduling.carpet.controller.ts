/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Param, Post, SetMetadata, UseGuards } from '@nestjs/common';
import { EditSchedulingCarpetDto } from 'src/modules/schedulingCarpet/DTO/edit.scheduling.carpet.dto';
import { SchedulingCarpetDto } from 'src/modules/schedulingCarpet/DTO/Scheduling.carpet.dto';
import { SchedulingCarpet } from 'src/modules/schedulingCarpet/scheduling.carpet.entity';
import { ApiResponse } from 'src/misc/api.restonse';
import SchadulingCarpetService from 'src/modules/schedulingCarpet/scheduling.carpet.service';
import { RolleCheckerGard } from 'src/rollecheckergard/rolle.checker.gatd';

@Controller('api/schedulingCarpet')
export default class SchedulingCarpetController {
  constructor(private readonly schedulingCarpetService: SchadulingCarpetService) {}

  @Post('add/:id')
  @UseGuards(RolleCheckerGard)
  @SetMetadata('allow_to_roles', ['user'])
  async addSchedulingCarpet(
    @Body() data: SchedulingCarpetDto,
    @Param('id') userId: number,
  ): Promise<SchedulingCarpet> {
    return await this.schedulingCarpetService.addSchedulingCarpet(data, userId);
  }

  @Post('edit/:id')
  @UseGuards(RolleCheckerGard)
  @SetMetadata('allow_to_roles', ['user'])
  async editSchedulingCarpet(
    @Body() data: EditSchedulingCarpetDto,
    @Param('id') userId: number,
  ): Promise<SchedulingCarpet | ApiResponse> {
    return await this.schedulingCarpetService.editSchedulingCarpet(data, userId);
  }

  @Get('getAll/:id')
  @UseGuards(RolleCheckerGard)
  @SetMetadata('allow_to_roles', ['user'])
  async getAll(@Param('id') userId: number): Promise<SchedulingCarpet[]> {
    return await this.schedulingCarpetService.getAllScheduling(userId);
  }
}
