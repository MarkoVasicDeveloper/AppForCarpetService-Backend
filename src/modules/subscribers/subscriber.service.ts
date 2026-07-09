import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AddSubscriberDto } from './dto/add-subscriber.dto';
import { EditSubscriberDto } from './dto/edit-subscriber.dto';
import { Subscriber } from './subscriber.entity';

@Injectable()
export class SubscriberService {
  constructor(
    @InjectRepository(Subscriber)
    private readonly subscriberRepository: Repository<Subscriber>,
  ) {}

  async addSubscriber(userId: number, data: AddSubscriberDto): Promise<Subscriber> {
    const subscriber = this.subscriberRepository.create({
      ...data,
      userId,
    });

    try {
      return await this.subscriberRepository.save(subscriber);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create subscriber record.');
    }
  }

  async editSubscriber(
    subscriberId: number,
    userId: number,
    data: EditSubscriberDto,
  ): Promise<Subscriber> {
    const subscriber = await this.subscriberRepository.findOne({
      where: {
        id: subscriberId,
        userId: userId,
      },
    });

    if (!subscriber) {
      throw new NotFoundException('Subscription record not found.');
    }

    this.subscriberRepository.merge(subscriber, data);

    return await this.subscriberRepository.save(subscriber);
  }

  async findByUserId(userId: number): Promise<Subscriber[]> {
    return await this.subscriberRepository.find({
      where: {
        userId: userId,
      },
      order: {
        expireAt: 'DESC',
      },
      take: 1,
    });
  }

  async findAllForAdmin(): Promise<Subscriber[]> {
    return await this.subscriberRepository.find({
      order: {
        timeAt: 'DESC',
      },
    });
  }
}
