/* eslint-disable prettier/prettier */
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AddCarpetDto } from "dto/Carpet/add.carpet.dto";
import { DateCarpetDto } from "dto/Carpet/date.carpet.dto";
import { Carpet } from "entities/Carpet";
import { ApiResponse } from "src/misc/api.restonse";
import { Repository } from "typeorm";

@Injectable()

export class CarpetService {
    constructor(@InjectRepository(Carpet) private readonly carpetService: Repository<Carpet>) { }

    async addCarpet(data: AddCarpetDto):Promise<Carpet | ApiResponse>{
        const carpet = new Carpet();
        carpet.carpetReception = data.carpetReception;
        carpet.width = data.width;
        carpet.heigth = data.height;
        carpet.price = data.price;
        carpet.carpetSurface = data.width * data.height;
        carpet.forPayment = data.width * data.height * data.price;
        carpet.workerId = data.workerId;
        carpet.deliveryTime = data.deliveryDate;

        const savedCarpet = await this.carpetService.save(carpet);

        if (!savedCarpet){
            return new ApiResponse('error', -11000, 'Catpet not saved');
        }

        return savedCarpet;
    }

    async editCarpet(data: AddCarpetDto, carpetId: number):Promise<Carpet | ApiResponse> {
        const carpet = await this.carpetService.findOne(carpetId);

        if (!carpet) {
            return new ApiResponse('error', -11001, 'Carpet is not found');
        }

        carpet.carpetReception = data.carpetReception;
        carpet.width = data.width;
        carpet.heigth = data.height;
        carpet.price = data.price;
        carpet.carpetSurface = data.width * data.height;
        carpet.forPayment = data.width * data.height * data.price;
        carpet.workerId = data.workerId;
        carpet.deliveryTime = data.deliveryDate;

        const savedCarpet = await this.carpetService.save(carpet);

        if (!savedCarpet){
            return new ApiResponse('error', -11000, 'Catpet not saved');
        }

        return savedCarpet;
    }

    async getAllCarpetByDate (data: DateCarpetDto):Promise<Carpet[] | ApiResponse> {
        const carpets = await this.carpetService.find({
            where: {
                deliveryTime : data.data
            }
        })

        if(!carpets) {
            return new ApiResponse('error', -11002, 'No carpet for delivery')
        }

        return carpets;
    }
}