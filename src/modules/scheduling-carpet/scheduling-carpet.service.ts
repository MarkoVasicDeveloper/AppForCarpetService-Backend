import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AddSchedulingCarpetDto } from './dto/add-scheduling-carpet.dto';
import { EditSchedulingCarpetDto } from './dto/edit-scheduling-carpet.dto';
import { SchedulingCarpet } from './scheduling-carpet.entity';

@Injectable()
export class SchedulingCarpetService {
  constructor(
    @InjectRepository(SchedulingCarpet)
    private readonly carpetRepository: Repository<SchedulingCarpet>,
  ) {}

  async addSchedulingCarpet(
    data: AddSchedulingCarpetDto,
    userId: number,
  ): Promise<SchedulingCarpet> {
    const schedulingCarpet = this.carpetRepository.create({ ...data, userId });
    return await this.carpetRepository.save(schedulingCarpet);
  }

  async editSchedulingCarpet(
    id: number,
    userId: number,
    data: EditSchedulingCarpetDto,
  ): Promise<SchedulingCarpet> {
    const schedulingCarpet = await this.carpetRepository.findOne({
      where: { id, userId },
    });

    if (!schedulingCarpet) {
      throw new NotFoundException('Scheduling record not found.');
    }

    this.carpetRepository.merge(schedulingCarpet, data);
    return await this.carpetRepository.save(schedulingCarpet);
  }

  async getAllScheduling(userId: number): Promise<SchedulingCarpet[]> {
    return await this.carpetRepository.find({
      where: {
        userId,
        isScheduling: false,
      },
      order: { timeAt: 'DESC' },
    });
  }

  async deleteScheduling(id: number, userId: number): Promise<void> {
    const result = await this.carpetRepository.delete({ id, userId });
    if (result.affected === 0) {
      throw new NotFoundException('Scheduling record not found or access denied.');
    }
  }
}
