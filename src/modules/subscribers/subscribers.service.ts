import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AddSubscribersDto } from 'src/modules/subscribers/dto/add-subscribers.dto';
import { ApiResponse } from 'src/shared/response/api-response';
import { Repository } from 'typeorm';

import { Subscriber } from './subscriber.entity';

@Injectable()
export class SubscibersService {
  constructor(
    @InjectRepository(Subscriber) private readonly subscribersService: Repository<Subscriber>,
  ) {}

  async addSubscriber(data: AddSubscribersDto): Promise<Subscriber | ApiResponse> {
    const subscriber = new Subscriber();
    subscriber.userId = data.userId;
    subscriber.timeAt = data.timeAt;
    subscriber.expireAt = data.expireAt;
    subscriber.price = data.price;

    const savedSubscriber = await this.subscribersService.save(subscriber);

    if (!savedSubscriber) {
      return new ApiResponse(false, -13000, 'Some mistake');
    }

    return savedSubscriber;
  }

  async findByUserId(userId: number): Promise<Subscriber[]> {
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
