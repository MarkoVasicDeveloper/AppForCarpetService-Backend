import { Body, Controller, Get, Param, Post, SetMetadata, UseGuards } from '@nestjs/common';
import { AddSuppliersDto } from 'src/modules/suppliers/dto/add-suppliers.dto';
import { EditSuppliersDto } from 'src/modules/suppliers/dto/edit-suppliers.dto';
import { Suppliers } from 'src/modules/suppliers/suppliers.entity';
import { SuppliersService } from 'src/modules/suppliers/suppliers.service';
import { RoleCheckerGuard } from 'src/shared/guards/role-checker.guard';
import { ApiResponse } from 'src/shared/response/api-response';

@Controller('api/suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}
  @Post('addSuppliers/:costsId/:id')
  @UseGuards(RoleCheckerGuard)
  @SetMetadata('allow_to_roles', ['user', 'administrator'])
  async addSupplier(
    @Body() data: AddSuppliersDto,
    @Param('id') userId: number,
    @Param('costsId') costsId: number,
  ): Promise<Suppliers | ApiResponse> {
    return await this.suppliersService.addSupplier(data, userId, costsId);
  }

  @Post('editSuppliers/:supplierId/:id')
  @UseGuards(RoleCheckerGuard)
  @SetMetadata('allow_to_roles', ['user', 'administrator'])
  async editSuppliers(
    @Body() data: EditSuppliersDto,
    @Param('id') userId: number,
    @Param('supplierId') supplierId: number,
  ): Promise<Suppliers | ApiResponse> {
    return await this.suppliersService.editSuppliers(data, userId, supplierId);
  }

  @Get('getAllSuppliers/:costsId/:userId')
  @UseGuards(RoleCheckerGuard)
  @SetMetadata('allow_to_roles', ['user', 'administrator'])
  async getAllSuppliers(
    @Param('costsId') costsId: number,
    @Param('userId') userId: number,
  ): Promise<Suppliers[]> {
    return await this.suppliersService.getAllSuppliers(userId, costsId);
  }
}
