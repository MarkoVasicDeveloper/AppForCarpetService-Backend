import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';

import { AddSubscriberDto } from './dto/add-subscriber.dto';
import { EditSubscriberDto } from './dto/edit-subscriber.dto';
import { Subscriber } from './subscriber.entity';
import { SubscriberService } from './subscriber.service';

type MockRepository<T extends ObjectLiteral> = {
  [P in keyof Repository<T>]?: jest.Mock;
};

describe('SubscriberService', () => {
  let service: SubscriberService;
  let subscriberRepository: MockRepository<Subscriber>;

  beforeEach(async () => {
    const mockRepositoryFactory = (): MockRepository<object> => ({
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      merge: jest.fn(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriberService,
        {
          provide: getRepositoryToken(Subscriber),
          useFactory: mockRepositoryFactory,
        },
      ],
    }).compile();

    service = module.get<SubscriberService>(SubscriberService);
    subscriberRepository = module.get<MockRepository<Subscriber>>(getRepositoryToken(Subscriber));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addSubscriber', () => {
    const dto: AddSubscriberDto = {
      expireAt: new Date('2026-12-31'),
      price: 1200,
    };
    const userId = 1;

    it('should successfully create a subscriber record', async () => {
      subscriberRepository.create!.mockImplementation((data) => data);
      subscriberRepository.save!.mockImplementation(
        async (sub) => ({ id: 50, ...(sub as object) }) as Subscriber,
      );

      const result = await service.addSubscriber(userId, dto);

      expect(subscriberRepository.create).toHaveBeenCalledWith({ ...dto, userId });
      expect(result.id).toBe(50);
      expect(result.price).toBe(1200);
    });

    it('should throw InternalServerErrorException if repository save fails', async () => {
      subscriberRepository.create!.mockImplementation((data) => data);
      subscriberRepository.save!.mockRejectedValue(new Error('Database disconnect'));

      await expect(service.addSubscriber(userId, dto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('editSubscriber', () => {
    const subscriberId = 50;
    const userId = 1;
    const dto: EditSubscriberDto = { price: 1500 };

    it('should successfully update and merge subscriber data', async () => {
      const existingSubscriber = { id: subscriberId, userId, price: 1200 } as Subscriber;

      subscriberRepository.findOne!.mockResolvedValue(existingSubscriber);
      subscriberRepository.merge!.mockImplementation((sub, data) => Object.assign(sub, data));
      subscriberRepository.save!.mockImplementation(async (sub) => sub as Subscriber);

      const result = await service.editSubscriber(subscriberId, userId, dto);

      expect(subscriberRepository.findOne).toHaveBeenCalledWith({
        where: { id: subscriberId, userId },
      });
      expect(subscriberRepository.merge).toHaveBeenCalledWith(existingSubscriber, dto);
      expect(result.price).toBe(1500);
    });

    it('should throw NotFoundException if subscription record does not exist', async () => {
      subscriberRepository.findOne!.mockResolvedValue(null);

      await expect(service.editSubscriber(subscriberId, userId, dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByUserId', () => {
    it('should return a single latest subscriber record for user', async () => {
      const userId = 1;
      const mockResult = [{ id: 50, userId }] as Subscriber[];
      subscriberRepository.find!.mockResolvedValue(mockResult);

      const result = await service.findByUserId(userId);

      expect(subscriberRepository.find).toHaveBeenCalledWith({
        where: { userId },
        order: { expireAt: 'DESC' },
        take: 1,
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('findAllForAdmin', () => {
    it('should return all subscriber records ordered by creation date', async () => {
      const mockResult = [{ id: 1 }, { id: 2 }] as Subscriber[];
      subscriberRepository.find!.mockResolvedValue(mockResult);

      const result = await service.findAllForAdmin();

      expect(subscriberRepository.find).toHaveBeenCalledWith({
        order: { timeAt: 'DESC' },
      });
      expect(result).toEqual(mockResult);
    });
  });
});
