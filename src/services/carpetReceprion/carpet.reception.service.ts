/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CarpetReception } from "entities/CarpetReception";
import { AddCarpetReceptionDto } from "dto/CarpetReception/add.carpet.reception.dto";
import { Clients } from "entities/Clients";
import { ApiResponse } from "src/misc/api.restonse";
import { Repository } from "typeorm";
import { EditCarpetReception } from "dto/CarpetReception/edit.carpet.reception.dto";

@Injectable()

export class CarpetReceptionsService {
    constructor(@InjectRepository(CarpetReception) private readonly carpetReception: Repository<CarpetReception>,
                @InjectRepository(Clients) private readonly clientsService: Repository<Clients>) {}

    async addCarpetReception (data: AddCarpetReceptionDto, workerId: number): Promise <Clients | ApiResponse> {
        const client = await this.clientsService.findOne(data.clientsId)

        if (!client) {
            return new ApiResponse('error', -4001, 'Client is not found')
        }

        const carpet = new CarpetReception();
        carpet.numberOfCarpet = data.numberOfCarpet;
        carpet.numberOfTracks = data.numberOfTracks;
        carpet.note = data.note;
        carpet.clientsId = client.clientsId;
        carpet.workerId = workerId;

        await this.carpetReception.save(carpet) 

        return await this.clientsService.findOne(client.clientsId, {
            relations: ['carpetReceptions', 'carpetReceptions.carpetImages']
        })
    }

    async editCarpetReception (data: EditCarpetReception, workerId: number): Promise <CarpetReception | ApiResponse> {
        const carpetReception = await this.carpetReception.findOne(data.carpetReceptionId)

        if (!carpetReception) {
            return new ApiResponse('error', -5001, 'Reception is not found')
        }

        carpetReception.workerId = workerId

        if(data.numberOfCarpet) {
            carpetReception.numberOfCarpet = data.numberOfCarpet;
        }

        if(data.numberOfTracks) {
            carpetReception.numberOfTracks = data.numberOfTracks;
        }

        if(data.note) {
            carpetReception.note = data.note;
        }

        if(data.prepare) {
            carpetReception.prepare = data.prepare
        }

        if(data.delivered) {
            carpetReception.delivered = data.delivered
        }

        if(data.deliveredTime) {
            carpetReception.deliveryTime = data.deliveredTime
        }

        const editCarpetReception = await this.carpetReception.save(carpetReception)

        return editCarpetReception;
    }

    async getAllReceptionByuser(clientsId: number):Promise<CarpetReception[] | ApiResponse> {
        const allReceptions = await this.carpetReception.find({
            where: {
                clientsId: clientsId
            },
            order: {
                timeAt: 'ASC'
            }
        })

        if (!allReceptions) {
            return new ApiResponse('error', -11000, 'No order')
        }

        return allReceptions;
    }

    async getReceptionById(id: number):Promise <CarpetReception | ApiResponse> {
        const carpetReception = await this.carpetReception.findOne(id);

        if(!carpetReception) {
            return new ApiResponse('error', -5001, 'Reception is not found')
        }

        return carpetReception;
    }
}