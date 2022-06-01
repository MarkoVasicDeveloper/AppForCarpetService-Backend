import { Controller, Post, UseGuards, SetMetadata, Param, Get, Body } from '@nestjs/common';
import { RolleCheckerGard } from "src/rollecheckergard/rolle.checker.gatd";
import { ApiResponse } from "src/misc/api.restonse";
import { AddNewIncomeDto } from 'dto/AddNewIncome/add.new.income.dto';
import { EditNewIncomeDto } from 'dto/AddNewIncome/edit.new.income.dto';
import { AddNewIncomeService } from "src/services/AddNewIncome/addNewIncome.service";
import { AddNewIncome } from 'entities/AddNewIncome';

@Controller('api/newIncome')

export class AddNewIncomeController {
	constructor(private readonly addNewIncomeService: AddNewIncomeService) {}

	@Post('add')
    @UseGuards(RolleCheckerGard)
    @SetMetadata('allow_to_roles', ['user', 'administrator'])
    async addNewIncome(@Body() data: AddNewIncomeDto):Promise<AddNewIncome | ApiResponse> {
    	return await this.addNewIncomeService.addNewIncome(data);
    }

    @Post('edit')
    @UseGuards(RolleCheckerGard)
    @SetMetadata('allow_to_roles', ['user', 'administrator'])
    async editNewIncome(@Body() data: EditNewIncomeDto):Promise< AddNewIncome | ApiResponse > {
    	return await this.addNewIncomeService.editNewIncome(data)
    }

    @Get(':userId/:incomeId')
    @UseGuards(RolleCheckerGard)
    @SetMetadata('allow_to_roles', ['user', 'administrator'])
    async getAllNewIncome(
    	@Param('userId') userId: number, 
    	@Param('incomeId') incomeId: number):Promise<AddNewIncome[]>{
    	return await this.addNewIncomeService.getAllNewIncomeFromIncome(userId, incomeId)
    }
}