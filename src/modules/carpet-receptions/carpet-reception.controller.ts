import { Body, Controller, Get, Param, Post, Put, UseGuards, ParseIntPipe } from '@nestjs/common';
import { CurrentOwnerId } from 'src/shared/decorators/current-owner-id.decorator';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { RoleCheckerGuard } from 'src/shared/guards/role-checker.guard';

import { CarpetReception } from './carpet-reception.entity';
import { CarpetReceptionsService } from './carpet-reception.service';
import { AddCarpetReceptionDto } from './dto/add-carpet-reception.dto';
import { EditCarpetReception } from './dto/edit-carpet-reception.dto';

@Controller('carpet-receptions')
@UseGuards(RoleCheckerGuard)
@Roles(Role.ADMINISTRATOR, Role.USER, Role.WORKER)
export class CarpetReceptionController {
  constructor(private readonly carpetReceptionService: CarpetReceptionsService) {}

  @Post()
  async addReception(
    @Body() data: AddCarpetReceptionDto,
    @CurrentOwnerId() workerId: number,
  ): Promise<CarpetReception> {
    return await this.carpetReceptionService.addCarpetReception(data, workerId);
  }

  @Put()
  async editCarpetReception(
    @Body() data: EditCarpetReception,
    @CurrentOwnerId() workerId: number,
  ): Promise<CarpetReception> {
    return await this.carpetReceptionService.editCarpetReception(data, workerId);
  }

  @Get('client/:id')
  async getAllReceptionsByClient(
    @Param('id', ParseIntPipe) clientsId: number,
    @CurrentOwnerId() userId: number,
  ): Promise<CarpetReception[]> {
    return await this.carpetReceptionService.getAllReceptionByUser(clientsId, userId);
  }

  @Get('status/delivery')
  async getReceptionByDelivery(@CurrentOwnerId() userId: number): Promise<CarpetReception[]> {
    return await this.carpetReceptionService.getReceptionByDelivery(userId);
  }

  @Get('status/biggest/client/:clientId')
  async getAllReceptionsByClientOrdered(
    @Param('clientId', ParseIntPipe) clientsId: number,
    @CurrentOwnerId() userId: number,
  ): Promise<CarpetReception[]> {
    return await this.carpetReceptionService.getAllReceptionsOrderedForClient(clientsId, userId);
  }

  @Get(':id')
  async getReceptionById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentOwnerId() userId: number,
  ): Promise<CarpetReception> {
    return await this.carpetReceptionService.getReceptionById(id, userId);
  }
}
