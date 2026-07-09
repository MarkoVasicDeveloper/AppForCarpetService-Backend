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
import { AddSupplierDto } from 'src/modules/suppliers/dto/add-supplier.dto';
import { EditSupplierDto } from 'src/modules/suppliers/dto/edit-supplier.dto';
import { Supplier } from 'src/modules/suppliers/supplier.entity';
import { SupplierService } from 'src/modules/suppliers/supplier.service';
import { CurrentOwnerId } from 'src/shared/decorators/current-owner-id.decorator';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { RoleCheckerGuard } from 'src/shared/guards/role-checker.guard';

@Controller('suppliers')
@UseGuards(RoleCheckerGuard)
@Roles(Role.ADMINISTRATOR, Role.USER)
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  async addSupplier(
    @CurrentOwnerId() userId: number,
    @Body() data: AddSupplierDto,
  ): Promise<Supplier> {
    return await this.supplierService.addSupplier(data, userId);
  }

  @Get()
  async getAllSuppliers(@CurrentOwnerId() userId: number): Promise<Supplier[]> {
    return await this.supplierService.getAllSuppliers(userId);
  }

  @Get(':id')
  async getSupplier(
    @CurrentOwnerId() userId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Supplier> {
    return await this.supplierService.getSupplierById(id, userId);
  }

  @Patch(':id')
  async editSupplier(
    @CurrentOwnerId() userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() data: EditSupplierDto,
  ): Promise<Supplier> {
    return await this.supplierService.editSupplier(id, userId, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSupplier(
    @CurrentOwnerId() userId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.supplierService.deleteSupplier(id, userId);
  }
}
