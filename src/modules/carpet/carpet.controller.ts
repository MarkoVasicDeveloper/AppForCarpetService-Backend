import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { CurrentUser } from 'src/shared/decorators/current-user.decorators';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { RoleCheckerGuard } from 'src/shared/guards/role-checker.guard';

import { AuthenticatedUser } from '../auth/types/jwt-payload.interface';

import { Carpet } from './carpet.entity';
import { CarpetService } from './carpet.service';
import { AddCarpetDto } from './dto/add-carpet.dto';
import { EditCarpetDto } from './dto/edit-carpet.dto';
import { GetCarpetsByDateDto } from './dto/get-carpets-by-date.dto';

@Controller('carpets')
@UseGuards(RoleCheckerGuard)
@Roles(Role.USER, Role.ADMINISTRATOR, Role.WORKER)
export class CarpetController {
  constructor(private readonly carpetService: CarpetService) {}

  @Get('by-date')
  async getCarpetsByDate(
    @Query() query: GetCarpetsByDateDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Carpet[]> {
    const ownerId = user.role === Role.WORKER ? user.userId! : user.id;
    return await this.carpetService.getAllCarpetsByDate(query.date, ownerId);
  }

  @Get('client/:receptionId')
  async getAllCarpetsByClientId(
    @Param('receptionId', ParseIntPipe) receptionId: number,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Carpet[]> {
    const ownerId = user.role === Role.WORKER ? user.userId! : user.id;
    return await this.carpetService.getAllCarpetsByClientId(receptionId, ownerId);
  }

  @Post()
  async addCarpet(
    @Body() data: AddCarpetDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Carpet> {
    const ownerId = user.role === Role.WORKER ? user.userId! : user.id;

    const creatorWorkerId = user.role === Role.WORKER ? user.id : undefined;

    return await this.carpetService.addCarpet(data, ownerId, creatorWorkerId);
  }

  @Put(':id')
  async editCarpet(
    @Param('id', ParseIntPipe) carpetId: number,
    @Body() data: EditCarpetDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Carpet> {
    const ownerId = user.role === Role.WORKER ? user.userId! : user.id;
    return await this.carpetService.editCarpet(carpetId, data, ownerId);
  }
}
