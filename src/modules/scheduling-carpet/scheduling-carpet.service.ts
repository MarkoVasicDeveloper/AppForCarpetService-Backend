import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EditSchedulingCarpetDto } from 'src/modules/scheduling-carpet/dto/edit-scheduling-carpet.dto';
import { SchedulingCarpetDto } from 'src/modules/scheduling-carpet/dto/scheduling-carpet.dto';
import { SchedulingCarpet } from 'src/modules/scheduling-carpet/scheduling-carpet.entity';
import { ApiResponse } from 'src/shared/response/api-response';
import { Repository } from 'typeorm';

@Injectable()
export default class SchedulingCarpetService {
  constructor(
    @InjectRepository(SchedulingCarpet)
    private readonly schedulingCarpetService: Repository<SchedulingCarpet>,
  ) {}

  async addSchedulingCarpet(data: SchedulingCarpetDto, userId: number): Promise<SchedulingCarpet> {
    const schedulingCarpet = new SchedulingCarpet();
    schedulingCarpet.name = data.name;
    schedulingCarpet.surname = data.surname;
    schedulingCarpet.address = data.address;
    schedulingCarpet.phone = data.phone;
    schedulingCarpet.userId = userId;

    if (data.email) {
      schedulingCarpet.email = data.email;
    }

    if (data.note) {
      schedulingCarpet.note = data.note;
    }

    const savedSchedulingCarpet = await this.schedulingCarpetService.save(schedulingCarpet);

    return savedSchedulingCarpet;
  }

  async editSchedulingCarpet(
    data: EditSchedulingCarpetDto,
    userId: number,
  ): Promise<SchedulingCarpet | ApiResponse> {
    const schedulingCarpet = await this.schedulingCarpetService.findOne({
      where: {
        schedulingCarpetId: data.scheduling_carpet_id,
        userId: userId,
      },
    });

    if (!schedulingCarpet) {
      return new ApiResponse(false, -12001, 'Not found');
    }

    schedulingCarpet.isScheduling = true;

    const savedShedulingCarpet = await this.schedulingCarpetService.save(schedulingCarpet);

    return savedShedulingCarpet;
  }

  async getAllScheduling(userId: number): Promise<SchedulingCarpet[]> {
    const all = await this.schedulingCarpetService.find({
      where: {
        isScheduling: false,
        userId: userId,
      },
    });

    return all;
  }
}
