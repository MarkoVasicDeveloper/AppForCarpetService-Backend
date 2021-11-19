/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { AddWorkerDto } from "dto/worker/add.worker.dto";
import { EditWorkerDto } from "dto/worker/edit.worker.dto";
import { Worker } from "entities/Worker";
import { ApiResponse } from "src/misc/api.restonse";
import { WorkerService } from "src/services/worker/workers.service";

@Controller('api/worker')

export class WorkerController {
    constructor(private readonly workerService: WorkerService) { }

    @Post('addWorker')
    async addWorker (@Body() data: AddWorkerDto): Promise<Worker | ApiResponse> {
        return await this.workerService.addWorker(data)
    }

    @Post('editWorker')
    async editWorker (@Body() data: EditWorkerDto): Promise<Worker | ApiResponse> {
        return await this.workerService.editWorker(data)
    }

    @Post('findWorker')
    async findWorker (@Body() data: AddWorkerDto):Promise<Worker | ApiResponse> {
        return await this.workerService.findWorker(data)
    }

    @Get(':id/:userId')
    async findWorkerById(@Param('id') id: number, @Param('userId') userId: number):Promise<Worker | ApiResponse>{
        return await this.workerService.findWorkerById(id, userId);
    }
}