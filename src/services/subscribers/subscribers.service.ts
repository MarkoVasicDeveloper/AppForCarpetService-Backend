/* eslint-disable prettier/prettier */
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AddSubscribersDto } from "dto/Subscribers/add.subscribers.dto";
import { Subscribers } from "entities/Subscribers";
import { ApiResponse } from "src/misc/api.restonse";
import { Repository } from "typeorm";

@Injectable()

export class SubscibersService {
    constructor(@InjectRepository(Subscribers) private readonly subscribersService: Repository<Subscribers>) {}

    async addSubscriber(data: AddSubscribersDto):Promise<Subscribers | ApiResponse> {
        const subscriber = new Subscribers();
        subscriber.userId = data.userId;
        subscriber.timeAt = data.timeAt;
        subscriber.expireAt = data.expireAt;
        subscriber.price = data.price;

        const savedSubscriber = await this.subscribersService.save(subscriber);

        if(!savedSubscriber) {
            return new ApiResponse('error', -13000, 'Some mistake');
        }

        return savedSubscriber;
    }

    async findByUserId(userId: number): Promise<Subscribers[]> {
        const sub = await this.subscribersService.find({
            where: {
                userId: userId
            },
            order: {
                expireAt: 'DESC'
            },
            take: 1
        })

        return sub;
    }
}