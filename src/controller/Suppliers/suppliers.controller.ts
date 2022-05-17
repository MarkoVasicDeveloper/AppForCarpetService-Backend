/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  SetMetadata,
  UseGuards,
} from "@nestjs/common";
import { AddSuppliersDto } from "dto/Suppliers/add.suppliers.dto";
import { EditSuppliersDto } from "dto/Suppliers/edit.suppliers.dto";
import { Suppliers } from "entities/Suppliers";
import { ApiResponse } from "src/misc/api.restonse";
import { RolleCheckerGard } from "src/rollecheckergard/rolle.checker.gatd";
import { SuppliersService } from "src/services/Suppliers/suppliers.service";

@Controller("api/suppliers")
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}
  @Post("addSuppliers/:costsId/:id")
  @UseGuards(RolleCheckerGard)
  @SetMetadata("allow_to_roles", ["user", "administrator"])
  async addSupplier(
    @Body() data: AddSuppliersDto,
    @Param("id") userId: number,
    @Param("costsId") costsId: number
  ): Promise<Suppliers | ApiResponse> {
    return await this.suppliersService.addSupplier(data, userId, costsId);
  }

  @Post("editSuppliers/:supplierId/:id")
  @UseGuards(RolleCheckerGard)
  @SetMetadata("allow_to_roles", ["user", "administrator"])
  async editSuppliers(
    @Body() data: EditSuppliersDto,
    @Param("id") userId: number,
    @Param("supplierId") supplierId: number
  ): Promise<Suppliers | ApiResponse> {
    return await this.suppliersService.editSuppliers(data, userId, supplierId);
  }

  @Get("getAllSuppliers/:costsId/:userId")
  @UseGuards(RolleCheckerGard)
  @SetMetadata("allow_to_roles", ["user", "administrator"])
  async getAllSuppliers(
    @Param("costsId") costsId: number,
    @Param("userId") userId: number
  ): Promise<Suppliers[]> {
    return await this.suppliersService.getAllSuppliers(userId, costsId);
  }
}
