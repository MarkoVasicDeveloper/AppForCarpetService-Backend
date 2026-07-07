import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AddWorkerDto } from 'src/modules/worker/dto/add-worker.dto';
import { EditWorkerDto } from 'src/modules/worker/dto/edit-worker.dto';
import { Worker } from 'src/modules/worker/worker.entity';
import { CryptoUtil } from 'src/shared/utils/crypto.util';
import { Repository, QueryFailedError } from 'typeorm';

@Injectable()
export class WorkerService {
  constructor(
    @InjectRepository(Worker)
    private readonly workerRepository: Repository<Worker>,
  ) {}

  async addWorker(data: AddWorkerDto, userId: number): Promise<Worker> {
    const worker = this.workerRepository.create({
      name: data.name,
      userId,
    });

    worker.password = await CryptoUtil.hashPassword(data.password);

    try {
      return await this.workerRepository.save(worker);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const dbError = error.driverError as { errno?: number; code?: string };
        if (dbError.errno === 1062 || dbError.code === 'ER_DUP_ENTRY') {
          throw new ConflictException('The worker name is already busy!');
        }
      }
      throw new InternalServerErrorException('Failed to add worker to the database.');
    }
  }

  async editWorker(id: number, data: EditWorkerDto, userId: number): Promise<Worker> {
    const worker = await this.workerRepository.findOne({
      where: { workerId: id, userId },
    });

    if (!worker) {
      throw new NotFoundException('Worker is not found');
    }

    const isPasswordCorrect = await CryptoUtil.comparePassword(data.password, worker.password);
    if (!isPasswordCorrect) {
      throw new BadRequestException('Password is incorrect');
    }

    if (data.newName) {
      worker.name = data.newName;
    }

    if (data.newPassword) {
      worker.password = await CryptoUtil.hashPassword(data.newPassword);
    }

    return await this.workerRepository.save(worker);
  }

  async findWorker(name: string, password: string, userId: number): Promise<Worker> {
    const worker = await this.workerRepository.findOne({ where: { name, userId } });

    if (!worker) {
      throw new NotFoundException('Worker is not found!');
    }

    const isPasswordCorrect = await CryptoUtil.comparePassword(password, worker.password);
    if (!isPasswordCorrect) {
      throw new BadRequestException('Password is incorrect');
    }

    return worker;
  }

  async findWorkerById(id: number, userId: number): Promise<Worker> {
    const worker = await this.workerRepository.findOne({
      where: { workerId: id, userId },
    });

    if (!worker) {
      throw new NotFoundException('Worker is not found');
    }

    return worker;
  }

  async getWorkerByName(name: string): Promise<Worker | null> {
    return await this.workerRepository.findOne({ where: { name } });
  }

  async deleteWorker(id: number, userId: number): Promise<void> {
    const worker = await this.workerRepository.findOne({
      where: { workerId: id, userId },
    });

    if (!worker) {
      throw new NotFoundException(
        'Worker is not found or you do not have permission to delete them.',
      );
    }

    await this.workerRepository.remove(worker);
  }
}
