/* eslint-disable prettier/prettier */
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AddSuppliersDto } from "dto/Suppliers/add.suppliers.dto";
import { EditSuppliersDto } from "dto/Suppliers/edit.suppliers.dto";
import { Suppliers } from "entities/Suppliers";
import { ApiResponse } from "src/misc/api.restonse";
import { Repository } from "typeorm";

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Suppliers)
    private readonly suppliersService: Repository<Suppliers>
  ) {}

  async addSupplier(
    data: AddSuppliersDto,
    userId: number,
    costsId: number
  ): Promise<Suppliers | ApiResponse> {
    const supplier = await this.suppliersService.findOne({
      where: {
        userId: userId,
        costsId: costsId,
      },
    });

    if (supplier)
      return new ApiResponse("error", -4010, "Supplier alredy exist");

    const newSuppliers = new Suppliers();
    newSuppliers.costsId = costsId;
    newSuppliers.name = data.name;
    newSuppliers.userId = userId;
    if (data.address) newSuppliers.address = data.address;
    if (data.bankAccaunt) newSuppliers.bankAccount = data.bankAccaunt;
    if (data.pib) newSuppliers.pib = data.pib;

    return await this.suppliersService.save(newSuppliers);
  }

  async editSuppliers(
    data: EditSuppliersDto,
    userId: number,
    supplierId: number
  ): Promise<Suppliers | ApiResponse> {
    const supplier = await this.suppliersService.findOne({
      where: {
        suppliersId: supplierId,
        userId: userId,
      },
    });

    if (!supplier)
      return new ApiResponse("error", -4011, "Supplier is not fount");

    if (data.address) supplier.address = data.address;
    if (data.bankAccaunt) supplier.bankAccount = data.bankAccaunt;
    if (data.pib) supplier.pib = data.pib;
    if (data.name) supplier.name = data.name;
    if (data.costsId) supplier.costsId = data.costsId;

    return await this.suppliersService.save(supplier);
  }

  async getAllSuppliers(userId: number, costsId: number): Promise<Suppliers[]> {
    return await this.suppliersService.find({
      where: {
        userId: userId,
        suppliersId: costsId,
      },
    });
  }
}
