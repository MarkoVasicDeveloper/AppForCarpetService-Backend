import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ClientsService } from '../clients/clients.service';

import { CarpetReception } from './carpet-reception.entity';
import { AddCarpetReceptionDto } from './dto/add-carpet-reception.dto';
import { EditCarpetReception } from './dto/edit-carpet-reception.dto';

@Injectable()
export class CarpetReceptionsService {
  constructor(
    @InjectRepository(CarpetReception)
    private readonly carpetReceptionRepo: Repository<CarpetReception>,
    private readonly clientsService: ClientsService,
  ) {}

  async addCarpetReception(
    data: AddCarpetReceptionDto,
    workerId: number,
  ): Promise<CarpetReception> {
    const targetUserId = data.userId ?? workerId;

    const client = await this.clientsService.getClientById(data.clientsId, targetUserId);
    if (!client) {
      throw new NotFoundException(`Client with ID ${data.clientsId} not found.`);
    }

    const carpet = this.carpetReceptionRepo.create({
      numberOfCarpet: data.numberOfCarpet ?? null,
      numberOfTracks: data.numberOfTracks ?? null,
      note: data.note ?? null,
      clientsId: client.clientsId,
      workerId: workerId,
      carpetReceptionUser: data.carpetReceptionUser,
      userId: targetUserId,
    });

    return await this.carpetReceptionRepo.save(carpet);
  }

  async editCarpetReception(data: EditCarpetReception, workerId: number): Promise<CarpetReception> {
    const targetUserId = data.userId ?? workerId;

    const reception = await this.carpetReceptionRepo.findOne({
      where: {
        carpetReceptionUser: data.carpetReceptionId,
        userId: targetUserId,
      },
    });

    if (!reception) {
      throw new NotFoundException(`Carpet reception record not found.`);
    }

    reception.workerId = workerId;

    if (data.deliveredTime) {
      reception.deliveryTime = data.deliveredTime;
    }

    this.carpetReceptionRepo.merge(reception, data);

    return await this.carpetReceptionRepo.save(reception);
  }

  async getAllReceptionByUser(clientsId: number, userId: number): Promise<CarpetReception[]> {
    return await this.carpetReceptionRepo.find({
      where: { clientsId, userId },
      order: { timeAt: 'ASC' },
    });
  }

  async getReceptionById(id: number, userId: number): Promise<CarpetReception> {
    const reception = await this.carpetReceptionRepo.findOne({
      where: { carpetReceptionUser: id, userId },
      relations: ['client'],
    });

    if (!reception) {
      throw new NotFoundException(`Reception with ID ${id} not found.`);
    }

    return reception;
  }

  async getAllReceptionsOrderedForClient(
    clientsId: number,
    userId: number,
  ): Promise<CarpetReception[]> {
    const receptions = await this.carpetReceptionRepo.find({
      where: {
        clientsId: clientsId,
        userId: userId,
      },
      order: {
        carpetReceptionUser: 'DESC',
      },
      relations: ['client'],
    });

    if (!receptions || receptions.length === 0) {
      throw new NotFoundException(`No receptions found for client with ID ${clientsId}.`);
    }

    return receptions;
  }

  async getReceptionByDelivery(userId: number): Promise<CarpetReception[]> {
    return await this.carpetReceptionRepo.find({
      where: {
        delivered: false,
        userId: userId,
      },
      relations: ['client'],
    });
  }
}
