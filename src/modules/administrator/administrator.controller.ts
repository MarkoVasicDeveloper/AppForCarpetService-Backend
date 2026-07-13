import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdministratorService } from 'src/modules/administrator/administrator.service';
import { AddAdministratorDto } from 'src/modules/administrator/dto/add-administrator.dto';
import { EditAdministratorDto } from 'src/modules/administrator/dto/edit-administrator.dto';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { RoleCheckerGuard } from 'src/shared/guards/role-checker.guard';

import { Administrator } from './administrator.entity';

@Controller('administrators')
@UseGuards(RoleCheckerGuard)
@Roles(Role.ADMINISTRATOR)
export class AdministratorController {
  constructor(private readonly administratorService: AdministratorService) {}

  @Post()
  async addAdministrator(@Body() data: AddAdministratorDto): Promise<Administrator> {
    return await this.administratorService.addAdministrator(data);
  }

  @Put(':id')
  async editAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: EditAdministratorDto,
  ): Promise<Administrator> {
    const updatedAdmin = await this.administratorService.editAdmin(id, data);

    return updatedAdmin;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAdmin(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.administratorService.deleteAdmin(id);
  }

  @Get()
  async getAllAdmin(): Promise<Administrator[]> {
    return await this.administratorService.getAllAdmin();
  }

  @Get('search')
  async getAdminByUsername(@Query('username') username: string): Promise<Administrator | null> {
    return await this.administratorService.getAdminByUsername({ username });
  }
}
