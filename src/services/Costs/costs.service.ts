/* eslint-disable prettier/prettier */
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AddCostsDto } from "dto/Costs/add.costs.dto";
import { EditCostsDto } from "dto/Costs/edit.costs.dto";
import { Costs } from "entities/Costs";
import { ApiResponse } from "src/misc/api.restonse";
import { Repository } from "typeorm";

@Injectable()
export class CostsService {
  constructor(
    @InjectRepository(Costs) private readonly costsService: Repository<Costs>
  ) {}

  async addCosts(
    data: AddCostsDto,
    userId: number
  ): Promise<Costs | ApiResponse> {
    const costs = await this.costsService.findOne({
      where: {
        title: data.title,
      },
    });

    if (costs) return;
    const newCosts = new Costs();
    newCosts.title = data.title;
    newCosts.userId = userId;
    return await this.costsService.save(newCosts);
  }

  async editCosts(
    data: EditCostsDto,
    userId: number
  ): Promise<Costs | ApiResponse> {
    const costs = await this.costsService.findOne({
      where: {
        title: data.title,
        userId: userId,
      },
    });

    if (!costs) return;

    costs.title = data.editTitle;
    costs.userId = userId;
    return await this.costsService.save(costs);
  }

  async getAllCosts(userId: number): Promise<Costs[]> {
    return await this.costsService.find({
      where: {
        userId: userId,
      },
    });
  }
}
