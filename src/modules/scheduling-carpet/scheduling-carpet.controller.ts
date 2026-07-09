import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentOwnerId } from 'src/shared/decorators/current-owner-id.decorator';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { RoleCheckerGuard } from 'src/shared/guards/role-checker.guard';

import { AddSchedulingCarpetDto } from './dto/add-scheduling-carpet.dto';
import { EditSchedulingCarpetDto } from './dto/edit-scheduling-carpet.dto';
import { SchedulingCarpet } from './scheduling-carpet.entity';
import { SchedulingCarpetService } from './scheduling-carpet.service';

@Controller('scheduling-carpets')
@UseGuards(RoleCheckerGuard)
@Roles(Role.USER, Role.ADMINISTRATOR, Role.WORKER)
export class SchedulingCarpetController {
  constructor(private readonly schedulingCarpetService: SchedulingCarpetService) {}

  @Post()
  async addSchedulingCarpet(
    @CurrentOwnerId() userId: number,
    @Body() data: AddSchedulingCarpetDto,
  ): Promise<SchedulingCarpet> {
    return await this.schedulingCarpetService.addSchedulingCarpet(data, userId);
  }

  @Patch(':id')
  async editSchedulingCarpet(
    @CurrentOwnerId() userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() data: EditSchedulingCarpetDto,
  ): Promise<SchedulingCarpet> {
    return await this.schedulingCarpetService.editSchedulingCarpet(id, userId, data);
  }

  @Get()
  async getAll(@CurrentOwnerId() userId: number): Promise<SchedulingCarpet[]> {
    return await this.schedulingCarpetService.getAllScheduling(userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteScheduling(
    @CurrentOwnerId() userId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.schedulingCarpetService.deleteScheduling(id, userId);
  }
}
