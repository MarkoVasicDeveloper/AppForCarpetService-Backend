import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Income } from 'entities/Income';
import { AddIncomeDto } from 'dto/Income/add.income.dto';
import { ApiResponse } from "src/misc/api.restonse";
import { EditIncomeDto } from 'dto/Income/edit.income.dto';

@Injectable()

export class IncomeService {
	constructor(@InjectRepository(Income) private readonly incomeService: Repository<Income>) {}

	async addIncome(data: AddIncomeDto, userId: number):Promise<Income | ApiResponse> {
		const income = await this.incomeService.findOne({
			where: {
				name: data.name,
				price: data.price,
				userId: userId
			}
		})

		if(income) return new ApiResponse('error', -11001, 'Income alredy exist!');

		const newIncome = new Income();
		newIncome.name = data.name;
		newIncome.price = data.price;
		newIncome.userId = userId

		return await this.incomeService.save(newIncome)
	}

	async editIncome(data: EditIncomeDto, userId: number):Promise<Income | ApiResponse> {
		const income = await this.incomeService.findOne({
			where: {
				userId: userId,
				incomeId: data.incomeId
			}
		});

		if(!income) return new ApiResponse('error', -11002, 'Income not found');

		if(data.name) income.name = data.name;
		if(data.price) income.price = data.price;

		return await this.incomeService.save(income);
	}

	async getAllIncome(userId: number):Promise<Income[]> {
		return await this.incomeService.find({
			where: {
				userId: userId
			}
		});
	}
}