import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CurrentOwnerId } from 'src/shared/decorators/current-owner-id.decorator';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { RoleCheckerGuard } from 'src/shared/guards/role-checker.guard';

import { Client } from './client.entity';
import { ClientsService } from './clients.service';
import { AddClientsDto } from './dto/add-clients.dto';
import { EditClientDto } from './dto/edit-client.dto';
import { SearchClientsDto } from './dto/search-clients.dto';

@Controller('clients')
@UseGuards(RoleCheckerGuard)
@Roles(Role.USER, Role.ADMINISTRATOR, Role.WORKER)
export class ClientsController {
  constructor(private readonly clientService: ClientsService) {}

  @Post()
  async addClient(@Body() data: AddClientsDto, @CurrentOwnerId() ownerId: number): Promise<Client> {
    return await this.clientService.addClients(data, ownerId);
  }

  @Put(':id')
  async editClient(
    @Param('id', ParseIntPipe) clientId: number,
    @Body() data: EditClientDto,
    @CurrentOwnerId() ownerId: number,
  ): Promise<Client> {
    return await this.clientService.editClient(clientId, data, ownerId);
  }

  @Get()
  async getAllClients(@CurrentOwnerId() ownerId: number): Promise<Client[]> {
    return await this.clientService.getAllClients(ownerId);
  }

  @Get('search')
  async searchClients(
    @Query() query: SearchClientsDto,
    @CurrentOwnerId() ownerId: number,
  ): Promise<Client[]> {
    return await this.clientService.searchClients(ownerId, query);
  }

  @Get(':id')
  async getClientById(
    @Param('id', ParseIntPipe) clientId: number,
    @CurrentOwnerId() ownerId: number,
  ): Promise<Client> {
    return await this.clientService.getClientById(clientId, ownerId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteClient(
    @Param('id', ParseIntPipe) clientId: number,
    @CurrentOwnerId() ownerId: number,
  ): Promise<void> {
    await this.clientService.deleteClient(clientId, ownerId);
  }
}
