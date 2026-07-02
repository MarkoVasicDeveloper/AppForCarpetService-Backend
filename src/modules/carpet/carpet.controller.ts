import { Body, Controller, Get, Param, Post, SetMetadata, UseGuards } from '@nestjs/common';
import { Carpet } from 'src/modules/carpet/carpet.entity';
import { CarpetService } from 'src/modules/carpet/carpet.service';
import { AddCarpetDto } from 'src/modules/carpet/dto/add-carpet.dto';
import { DateCarpetDto } from 'src/modules/carpet/dto/date-carpet.dto';
import { RoleCheckerGuard } from 'src/shared/guards/role-checker.guard';
import { ApiResponse } from 'src/shared/response/api-response';

@Controller('api/carpet')
export class CarpetController {
  constructor(private readonly carpetService: CarpetService) {}

  @Post('addCarpet/:userId')
  @UseGuards(RoleCheckerGuard)
  @SetMetadata('allow_to_roles', ['user'])
  async addCarpet(
    @Body() data: AddCarpetDto,
    @Param('userId') userId: number,
  ): Promise<Carpet | ApiResponse> {
    return await this.carpetService.addCarpet(data, userId);
  }

  @Post('editCarpet/:id/:userId')
  @UseGuards(RoleCheckerGuard)
  @SetMetadata('allow_to_roles', ['user'])
  async editCarpet(
    @Body() data: AddCarpetDto,
    @Param('id') carpetId: number,
    @Param('userId') userId: number,
  ): Promise<Carpet | ApiResponse> {
    return await this.carpetService.editCarpet(data, carpetId, userId);
  }

  @Post('getCarpetByDate/:userId')
  @UseGuards(RoleCheckerGuard)
  @SetMetadata('allow_to_roles', ['user'])
  async getCarpetByDate(
    @Body() data: DateCarpetDto,
    @Param('userId') userId: number,
  ): Promise<Carpet[] | ApiResponse> {
    return await this.carpetService.getAllCarpetByDate(data, userId);
  }

  @Get('getAllCarpetByClientId/:receptionId/:userId')
  @UseGuards(RoleCheckerGuard)
  @SetMetadata('allow_to_roles', ['user'])
  async getAllCarpetByClientId(
    @Param('userId') userId: number,
    @Param('receptionId') receptionId: number,
  ): Promise<Carpet[] | ApiResponse> {
    return await this.carpetService.getAllCarpetByClientId(receptionId, userId);
  }
}
