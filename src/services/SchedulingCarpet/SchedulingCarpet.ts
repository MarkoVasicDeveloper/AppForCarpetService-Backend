/* eslint-disable prettier/prettier */
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EditSchedulingCarpetDto } from "dto/SchedulingCarpet/edit.scheduling.carpet.dto";
import { SchedulingCarpetDto } from "dto/SchedulingCarpet/Scheduling.carpet.dto";
import { SchedulingCarpet } from "entities/SchedulingCarpet";
import { ApiResponse } from "src/misc/api.restonse";
import { Repository } from "typeorm";

@Injectable()

export default class SchadulingCarpetService {
    constructor(@InjectRepository(SchedulingCarpet) private readonly schedulingCarpetService: Repository<SchedulingCarpet>) {}

    async addSchedulingCarpet(data: SchedulingCarpetDto): Promise <SchedulingCarpet> {
        const schedulingCarpet = new SchedulingCarpet();
        schedulingCarpet.name = data.name;
        schedulingCarpet.surname = data.surname;
        schedulingCarpet.address = data.address;
        schedulingCarpet.phone = data.phone;

        if(data.email) {
            schedulingCarpet.email = data.email;
        }

        if(data.note) {
            schedulingCarpet.note = data.note;
        }

        const savedSchedulingCarpet = await this.schedulingCarpetService.save(schedulingCarpet);

        return savedSchedulingCarpet;
    }

    async editSchedulingCarpet (data : EditSchedulingCarpetDto): Promise<SchedulingCarpet | ApiResponse> {
        const schedulingCarpet = await this.schedulingCarpetService.findOne(data.scheduling_carpet_id);

        if(!schedulingCarpet) {
            return new ApiResponse('error', -12001, 'Not found');
        }

        schedulingCarpet.isScheduling = true;

        const savedShedulingCarpet = await this.schedulingCarpetService.save(schedulingCarpet);

        return savedShedulingCarpet;
    }

    async getAllScheduling():Promise<SchedulingCarpet[]> {
        const all = await this.schedulingCarpetService.find({
            where: {
                isScheduling: '0'
            }
        });

        return all;
    }
}