import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AddSubscribersDto } from 'src/modules/subscribers/dto/add-subscribers.dto';
import { ApiResponse } from 'src/shared/response/api-response';
import { Repository } from 'typeorm';

import { Subscribers } from './subscribers.entity';

@Injectable()
export class SubscibersService {
  constructor(
    @InjectRepository(Subscribers) private readonly subscribersService: Repository<Subscribers>,
  ) {}

  async addSubscriber(data: AddSubscribersDto): Promise<Subscribers | ApiResponse> {
    const subscriber = new Subscribers();
    subscriber.userId = data.userId;
    subscriber.timeAt = data.timeAt;
    subscriber.expireAt = data.expireAt;
    subscriber.price = data.price;

    const savedSubscriber = await this.subscribersService.save(subscriber);

    if (!savedSubscriber) {
      return new ApiResponse('error', -13000, 'Some mistake');
    }

    return savedSubscriber;
  }

  async findByUserId(userId: number): Promise<Subscribers[]> {
    const sub = await this.subscribersService.find({
      where: {
        userId: userId,
      },
      order: {
        expireAt: 'DESC',
      },
      take: 1,
    });

    return sub;
  }
}
