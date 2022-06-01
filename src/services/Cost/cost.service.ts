/* eslint-disable prettier/prettier */
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AddCostDto } from "dto/Cost/add.cost.dto";
import { EditCostDto } from "dto/Cost/edit.cost.dto";
import { Cost } from "entities/Cost";
import { ApiResponse } from "src/misc/api.restonse";
import { Repository } from "typeorm";

@Injectable()
export class CostService {
  constructor(
    @InjectRepository(Cost) private readonly costService: Repository<Cost>
  ) {}

  async addCost(data: AddCostDto, userId: number): Promise<Cost | ApiResponse> {
    const newCost = new Cost();
    newCost.costsId = data.costsId;
    newCost.suppliersId = data.suppliersId;
    newCost.userId = userId;
    newCost.quantity = data.quantity;
    newCost.product = data.product;
    newCost.price = data.price;
    newCost.paid = data.paid;
    if (data.maturityData) newCost.maturityData = data.maturityData;

    return await this.costService.save(newCost);
  }

  async editCost(
    data: EditCostDto,
    costId: number
  ): Promise<Cost | ApiResponse> {
    const cost = await this.costService.findOne({
      where: {
        costId: costId,
        userId: data.userId,
      },
    });
    if (!cost) return new ApiResponse("error", -4003, "No such cost found");

    if (data.maturityData) cost.maturityData = data.maturityData;
    if (data.paid) cost.paid = data.paid;
    if (data.price) cost.price = data.price;
    if (data.quantity) cost.quantity = data.quantity;
    if (data.product) cost.product = data.product;
    if (data.suppliersId) cost.suppliersId = data.suppliersId;

    return await this.costService.save(cost);
  }

  async getAllCosts(costsId: number, userId: number): Promise<Cost[]> {
    return await this.costService.find({
      where: {
        userId: userId,
        costsId: costsId,
      },
    });
  }

  async getAllCostsBySupplier(
    costsId: number,
    userId: number,
    supplierId: number
  ): Promise<Cost[]> {
    return await this.costService.find({
      where: {
        userId: userId,
        costsId: costsId,
        suppliersId: supplierId,
      },
    });
  }
}
