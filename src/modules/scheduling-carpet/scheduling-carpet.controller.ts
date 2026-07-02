import { Body, Controller, Get, Param, Post, SetMetadata, UseGuards } from '@nestjs/common';
import { EditSchedulingCarpetDto } from 'src/modules/scheduling-carpet/dto/edit-scheduling-carpet.dto';
import { SchedulingCarpetDto } from 'src/modules/scheduling-carpet/dto/scheduling-carpet.dto';
import { SchedulingCarpet } from 'src/modules/scheduling-carpet/scheduling-carpet.entity';
import SchadulingCarpetService from 'src/modules/scheduling-carpet/scheduling-carpet.service';
import { RoleCheckerGuard } from 'src/shared/guards/role-checker.guard';
import { ApiResponse } from 'src/shared/response/api-response';

@Controller('api/schedulingCarpet')
export default class SchedulingCarpetController {
  constructor(private readonly schedulingCarpetService: SchadulingCarpetService) {}

  @Post('add/:id')
  @UseGuards(RoleCheckerGuard)
  @SetMetadata('allow_to_roles', ['user'])
  async addSchedulingCarpet(
    @Body() data: SchedulingCarpetDto,
    @Param('id') userId: number,
  ): Promise<SchedulingCarpet> {
    return await this.schedulingCarpetService.addSchedulingCarpet(data, userId);
  }

  @Post('edit/:id')
  @UseGuards(RoleCheckerGuard)
  @SetMetadata('allow_to_roles', ['user'])
  async editSchedulingCarpet(
    @Body() data: EditSchedulingCarpetDto,
    @Param('id') userId: number,
  ): Promise<SchedulingCarpet | ApiResponse> {
    return await this.schedulingCarpetService.editSchedulingCarpet(data, userId);
  }

  @Get('getAll/:id')
  @UseGuards(RoleCheckerGuard)
  @SetMetadata('allow_to_roles', ['user'])
  async getAll(@Param('id') userId: number): Promise<SchedulingCarpet[]> {
    return await this.schedulingCarpetService.getAllScheduling(userId);
  }
}
