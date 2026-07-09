import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
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

  @Patch(':supplierId')
  async editSupplier(
    @CurrentOwnerId() userId: number,
    @Param('supplierId', ParseIntPipe) supplierId: number,
    @Body() data: EditSupplierDto,
  ): Promise<Supplier> {
    return await this.supplierService.editSupplier(supplierId, userId, data);
  }

  @Get('costs/:costsId')
  async getAllSuppliersByCost(
    @CurrentOwnerId() userId: number,
    @Param('costsId', ParseIntPipe) costsId: number,
  ): Promise<Supplier[]> {
    return await this.supplierService.getAllSuppliers(userId, costsId);
  }
}
