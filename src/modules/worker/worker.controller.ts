import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AddWorkerDto } from 'src/modules/worker/dto/add-worker.dto';
import { EditWorkerDto } from 'src/modules/worker/dto/edit-worker.dto';
import { Worker } from 'src/modules/worker/worker.entity';
import { WorkerService } from 'src/modules/worker/worker.service';
import { ApiResponse } from 'src/shared/response/api-response';

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
