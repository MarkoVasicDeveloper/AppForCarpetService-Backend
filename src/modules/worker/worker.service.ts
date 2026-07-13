import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IAuthenticatableService,
  IAuthProfile,
} from 'src/modules/auth/types/authenticatable.interface';
import { AddWorkerDto } from 'src/modules/worker/dto/add-worker.dto';
import { EditWorkerDto } from 'src/modules/worker/dto/edit-worker.dto';
import { Worker } from 'src/modules/worker/worker.entity';
import { Role } from 'src/shared/enums/role.enum';
import { CryptoUtil } from 'src/shared/utils/crypto.util';
import { Repository, QueryFailedError } from 'typeorm';

@Injectable()
export class WorkerService implements IAuthenticatableService {
  constructor(
    @InjectRepository(Worker)
    private readonly workerRepository: Repository<Worker>,
    private readonly eventEmitter: EventEmitter2,
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
      throw new InternalServerErrorException('Failed to add worker to the database.', {
        cause: error,
      });
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

    this.eventEmitter.emit('worker.credentials.changed', { id });

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
    this.eventEmitter.emit('worker.deleted', { id });
    await this.workerRepository.remove(worker);
  }

  async authenticateIdentity(identity: string): Promise<IAuthProfile | null> {
    const worker = await this.getWorkerByName(identity);
    if (!worker) return null;

    return {
      id: worker.workerId,
      identity: worker.name,
      passwordHash: worker.password,
      role: Role.WORKER,
      userId: worker.userId,
    };
  }
}
