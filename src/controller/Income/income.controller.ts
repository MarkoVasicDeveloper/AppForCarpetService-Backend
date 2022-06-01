import { Body, Controller, Get, Param, Post, SetMetadata, UseGuards } from "@nestjs/common";
import { RolleCheckerGard } from "src/rollecheckergard/rolle.checker.gatd";
import { AddIncomeDto } from 'dto/Income/add.income.dto';
import { ApiResponse } from "src/misc/api.restonse";
import { Income } from 'entities/Income';
import { EditIncomeDto } from 'dto/Income/edit.income.dto';
import { IncomeService } from 'src/services/Income/Income'

@Controller('api/income')

export class IncomeController{
	constructor(private readonly incomeService: IncomeService) {}

	@Post('add?:userId')
    @UseGuards(RolleCheckerGard)
    @SetMetadata('allow_to_roles', ['user', 'administrator'])
    async addIncome(@Body() data: AddIncomeDto, @Param('userId') userId: number):Promise<Income | ApiResponse> {
    	return await this.incomeService.addIncome(data, userId);
    }

    @Post('edit/:userId')
    @UseGuards(RolleCheckerGard)
    @SetMetadata('allow_to_roles', ['user', 'administrator'])
    async editIncome(@Body() data: EditIncomeDto, @Param('userId') userId: number):Promise<Income | ApiResponse> {
    	return await this.incomeService.editIncome(data, userId);
    }

    @Get('getAll/:userId')
    @UseGuards(RolleCheckerGard)
    @SetMetadata('allow_to_roles', ['user', 'administrator'])
    async getAllIncome(@Param('userId') userId: number):Promise<Income[]> {
    	return await this.incomeService.getAllIncome(userId);
    }

}