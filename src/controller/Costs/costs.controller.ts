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
import { AddCostsDto } from "dto/Costs/add.costs.dto";
import { EditCostsDto } from "dto/Costs/edit.costs.dto";
import { Costs } from "entities/Costs";
import { ApiResponse } from "src/misc/api.restonse";
import { RolleCheckerGard } from "src/rollecheckergard/rolle.checker.gatd";
import { CostsService } from "src/services/Costs/costs.service";

@Controller("api/costs")
export class CostsController {
  constructor(private readonly costsService: CostsService) {}

  @Post("addCosts/:id")
  @UseGuards(RolleCheckerGard)
  @SetMetadata("allow_to_roles", ["user", "administrator"])
  async addCosts(
    @Body() data: AddCostsDto,
    @Param("id") userId: number
  ): Promise<Costs | ApiResponse> {
    return await this.costsService.addCosts(data, userId);
  }

  @Post("editCosts/:id")
  @UseGuards(RolleCheckerGard)
  @SetMetadata("allow_to_roles", ["user", "administrator"])
  async editCosts(
    @Body() data: EditCostsDto,
    @Param("id") userId: number
  ): Promise<Costs | ApiResponse> {
    return await this.costsService.editCosts(data, userId);
  }

  @Get("getAllCosts/:id")
  @UseGuards(RolleCheckerGard)
  @SetMetadata("allow_to_roles", ["user", "administrator"])
  async getAllCosts(@Param("id") userId: number): Promise<Costs[]> {
    return await this.costsService.getAllCosts(userId);
  }
}
