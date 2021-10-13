/* eslint-disable prettier/prettier */
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AddWorkerDto } from "dto/worker/add.worker.dto";
import { Worker } from "entities/Worker";
import { ApiResponse } from "src/misc/api.restonse";
import { Repository } from "typeorm";
import * as crypto from 'crypto';
import { EditWorkerDto } from "dto/worker/edit.worker.dto";

@Injectable()

export class WorkerService {
    constructor(@InjectRepository(Worker) private readonly workerService: Repository<Worker>) { }

    async addWorker (data: AddWorkerDto): Promise <Worker | ApiResponse> {
        try {
            const worker = new Worker();
            worker.name = data.name;

            const passwordHash = crypto.createHash('sha512');
            passwordHash.update(data.password);
            const passwordHashString = passwordHash.digest('hex').toString().toUpperCase();

            worker.password = passwordHashString;

            const savedWorker = await this.workerService.save(worker);

            return savedWorker;
        } catch (error) {
            return new ApiResponse('error', -5001, 'The name is busy!')
        }
    }

    async editWorker (data: EditWorkerDto): Promise <Worker | ApiResponse> {
        const worker = await this.workerService.findOne({
            where: {
                name: data.name
            }
        })

        if(!worker) {
            return new ApiResponse('error', -5002, 'Worker is not found')
        }

        const passwordHash = crypto.createHash('sha512');
        passwordHash.update(data.password);
        const passwordHashString = passwordHash.digest('hex').toString().toUpperCase();

        if (worker.password !== passwordHashString) {
            return new ApiResponse('error', -5003, 'Password is incorect')
        }

        if (data.newName) {
            worker.name = data.newName;
        }

        if (data.newPassword) {
            const passwordHash = crypto.createHash('sha512');
            passwordHash.update(data.newPassword);
            const passwordHashString = passwordHash.digest('hex').toString().toUpperCase();
            worker.password = passwordHashString;
        }

        return worker;
    }

    async findWorker (data: AddWorkerDto):Promise<Worker | ApiResponse> {
        const worker = await this.workerService.findOne({
            where: {
                name: data.name
            }
        })

        if(!worker) {
            return new ApiResponse('error', -5002, 'Worker is not found!')
        }

        const passwordHash = crypto.createHash('sha512');
        passwordHash.update(data.password);
        const passwordHashString = passwordHash.digest('hex').toString().toUpperCase();

        if (worker.password !== passwordHashString) {
            return new ApiResponse('error', -5003, 'Password is incorect')
        }

        return worker;
    }

    async findWorkerById (id: number):Promise<Worker | ApiResponse> {
        const worker = await this.workerService.findOne(id);

        if (!worker) {
            return new ApiResponse('error', -5002, 'Worker is not found');
        }

        return worker;
    }
}