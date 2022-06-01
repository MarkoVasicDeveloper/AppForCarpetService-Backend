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
import { AddCostDto } from "dto/Cost/add.cost.dto";
import { EditCostDto } from "dto/Cost/edit.cost.dto";
import { Cost } from "entities/Cost";
import { ApiResponse } from "src/misc/api.restonse";
import { RolleCheckerGard } from "src/rollecheckergard/rolle.checker.gatd";
import { CostService } from "src/services/Cost/cost.service";

@Controller("api/cost")
export class CostController {
  constructor(private readonly costService: CostService) {}

  @Post("addCost/:id")
  @UseGuards(RolleCheckerGard)
  @SetMetadata("allow_to_roles", ["user", "administrator"])
  async addCost(
    @Body() data: AddCostDto,
    @Param("id") userId: number
  ): Promise<Cost | ApiResponse> {
    return await this.costService.addCost(data, userId);
  }

  @Post("editCost/:id")
  @UseGuards(RolleCheckerGard)
  @SetMetadata("allow_to_roles", ["user", "administrator"])
  async editCost(
    @Body() data: EditCostDto,
    @Param("id") userId: number
  ): Promise<Cost | ApiResponse> {
    return await this.costService.editCost(data, userId);
  }

  @Get("getAllCosts/:costid/:id")
  @UseGuards(RolleCheckerGard)
  @SetMetadata("allow_to_roles", ["user", "administrator"])
  async getAllCosts(
    @Param("id") userId: number,
    @Param("costid") costId: number
  ): Promise<Cost[]> {
    return await this.costService.getAllCosts(costId, userId);
  }

  @Get("getAllCostsBySupplier/:costid/:supplierId/:id")
  @UseGuards(RolleCheckerGard)
  @SetMetadata("allow_to_roles", ["user", "administrator"])
  async getAllCostsBySupplier(
    @Param("id") userId: number,
    @Param("costid") costId: number,
    @Param("supplierId") supplierId: number
  ): Promise<Cost[]> {
    return await this.costService.getAllCostsBySupplier(
      costId,
      userId,
      supplierId
    );
  }
}
