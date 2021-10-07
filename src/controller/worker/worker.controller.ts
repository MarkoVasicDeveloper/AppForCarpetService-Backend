/* eslint-disable prettier/prettier */
import { Body, Controller, Post } from "@nestjs/common";
import { AddWorkerDto } from "dto/worker/add.worker.dto";
import { EditWorkerDto } from "dto/worker/edit.worker.dto";
import { Worker } from "entities/Worker";
import { ApiResponse } from "src/misc/api.restonse";
import { WorkerService } from "src/services/worker/workers.service";

@Controller('worker')

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
}