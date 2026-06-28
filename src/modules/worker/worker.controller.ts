/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AddWorkerDto } from 'src/modules/worker/DTO/add.worker.dto';
import { EditWorkerDto } from 'src/modules/worker/DTO/edit.worker.dto';
import { Worker } from 'src/modules/worker/worker.entity';
import { ApiResponse } from 'src/misc/api.restonse';
import { WorkerService } from 'src/modules/worker/workers.service';

@Controller('api/worker')
export class WorkerController {
  constructor(private readonly workerService: WorkerService) {}

  @Post('addWorker/:userId')
  async addWorker(
    @Body() data: AddWorkerDto,
    @Param('userId') userId: number,
  ): Promise<Worker | ApiResponse> {
    return await this.workerService.addWorker(data, userId);
  }

  @Post('editWorker/:userId')
  async editWorker(
    @Body() data: EditWorkerDto,
    @Param('userId') userId: number,
  ): Promise<Worker | ApiResponse> {
    return await this.workerService.editWorker(data, userId);
  }

  @Post('findWorker/:userId')
  async findWorker(
    @Body() data: AddWorkerDto,
    @Param('userId') userId: number,
  ): Promise<Worker | ApiResponse> {
    return await this.workerService.findWorker(data, userId);
  }

  @Get(':id/:userId')
  async findWorkerById(
    @Param('id') id: number,
    @Param('userId') userId: number,
  ): Promise<Worker | ApiResponse> {
    return await this.workerService.findWorkerById(id, userId);
  }
}
