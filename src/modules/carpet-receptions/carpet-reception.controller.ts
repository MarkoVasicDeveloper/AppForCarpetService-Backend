import { Body, Controller, Get, Param, Post, SetMetadata, UseGuards } from '@nestjs/common';
import { CarpetReceptionsService } from 'src/modules/carpet-receptions/carpet-reception.service';
import { AddCarpetReceptionDto } from 'src/modules/carpet-receptions/dto/add-carpet-reception.dto';
import { EditCarpetReception } from 'src/modules/carpet-receptions/dto/edit-carpet-reception.dto';
import { RoleCheckerGuard } from 'src/shared/guards/role-checker.guard';
import { ApiResponse } from 'src/shared/response/api-response';

import { CarpetReception } from './carpet-reception.entity';

@Controller('api/carpetReception')
export class CarpetReceptionController {
  constructor(private readonly carpetReceptionService: CarpetReceptionsService) {}

  @Post('addReception/:id')
  @UseGuards(RoleCheckerGuard)
  @SetMetadata('allow_to_roles', ['user'])
  async addReception(
    @Body() data: AddCarpetReceptionDto,
    @Param('id') workerId: number,
  ): Promise<CarpetReception> {
    return await this.carpetReceptionService.addCarpetReception(data, workerId);
  }

  @Post('editReception/:id/:userId')
  @UseGuards(RoleCheckerGuard)
  @SetMetadata('allow_to_roles', ['user'])
  async editCarpetReception(
    @Body() data: EditCarpetReception,
    @Param('id') workerId: number,
    @Param('userId') userId: number,
  ): Promise<CarpetReception | ApiResponse> {
    return await this.carpetReceptionService.editCarpetReception(data, workerId, userId);
  }

  @Post('getAllReceptionsByClient/:id/:idUser')
  @UseGuards(RoleCheckerGuard)
  @SetMetadata('allow_to_roles', ['user'])
  async getAllReceptionsByClient(
    @Param('id') clientsId: number,
    @Param('idUser') userId: number,
  ): Promise<CarpetReception[] | ApiResponse> {
    return await this.carpetReceptionService.getAllReceptionByuser(clientsId, userId);
  }

  @Post('getReceptionById/:id/:userId')
  @UseGuards(RoleCheckerGuard)
  @SetMetadata('allow_to_roles', ['user'])
  async getReceptionById(
    @Param('id') Id: number,
    @Param('userId') userId: number,
  ): Promise<CarpetReception | ApiResponse | null> {
    return await this.carpetReceptionService.getReceptionById(Id, userId);
  }

  @Post('getBigistReceptionByUser/:id')
  @UseGuards(RoleCheckerGuard)
  @SetMetadata('allow_to_roles', ['user'])
  async getBigistReceptionById(@Param('id') Id: number): Promise<CarpetReception[] | ApiResponse> {
    return await this.carpetReceptionService.getBigistReceptionForUser(Id);
  }

  @Get('getReceptionByDelivery')
  @UseGuards(RoleCheckerGuard)
  @SetMetadata('allow_to_roles', ['user'])
  async getReceptionByDelivery(): Promise<CarpetReception[] | ApiResponse> {
    return await this.carpetReceptionService.getReceptionByDelivery();
  }
}
