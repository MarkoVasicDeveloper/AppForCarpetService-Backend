import * as crypto from 'crypto';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AddWorkerDto } from 'src/modules/worker/dto/add-worker.dto';
import { EditWorkerDto } from 'src/modules/worker/dto/edit-worker.dto';
import { Worker } from 'src/modules/worker/worker.entity';
import { ApiResponse } from 'src/shared/response/api-response';
import { Repository } from 'typeorm';

@Injectable()
export class WorkerService {
  constructor(@InjectRepository(Worker) private readonly workerService: Repository<Worker>) {}

  async addWorker(data: AddWorkerDto, userId: number): Promise<Worker | ApiResponse> {
    try {
      const worker = new Worker();
      worker.name = data.name;
      worker.userId = userId;

      const passwordHash = crypto.createHash('sha512');
      passwordHash.update(data.password);
      const passwordHashString = passwordHash.digest('hex').toString().toUpperCase();

      worker.password = passwordHashString;

      const savedWorker = await this.workerService.save(worker);

      return savedWorker;
    } catch (error) {
      return new ApiResponse(false, -5001, 'The name is busy!');
    }
  }

  async editWorker(data: EditWorkerDto, userId: number): Promise<Worker | ApiResponse> {
    const worker = await this.workerService.findOne({
      where: {
        name: data.name,
        userId: userId,
      },
    });

    if (!worker) {
      return new ApiResponse(false, -5002, 'Worker is not found');
    }

    const passwordHash = crypto.createHash('sha512');
    passwordHash.update(data.password);
    const passwordHashString = passwordHash.digest('hex').toString().toUpperCase();

    if (worker.password !== passwordHashString) {
      return new ApiResponse(false, -5003, 'Password is incorect');
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

  async findWorker(data: AddWorkerDto, userId: number): Promise<Worker | ApiResponse> {
    const worker = await this.workerService.findOne({
      where: {
        name: data.name,
        userId: userId,
      },
    });

    if (!worker) {
      return new ApiResponse(false, -5002, 'Worker is not found!');
    }

    const passwordHash = crypto.createHash('sha512');
    passwordHash.update(data.password);
    const passwordHashString = passwordHash.digest('hex').toString().toUpperCase();

    if (worker.password !== passwordHashString) {
      return new ApiResponse(false, -5003, 'Password is incorect');
    }

    return worker;
  }

  async findWorkerById(id: number, userId: number): Promise<Worker | ApiResponse> {
    const worker = await this.workerService.findOne({
      where: {
        workerId: id,
        userId: userId,
      },
    });

    if (!worker) {
      return new ApiResponse(false, -5002, 'Worker is not found');
    }

    return worker;
  }
}
