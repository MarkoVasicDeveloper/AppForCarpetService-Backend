import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository, ILike } from 'typeorm';

import { Client } from './client.entity';
import { AddClientsDto } from './dto/add-clients.dto';
import { EditClientDto } from './dto/edit-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async addClients(data: AddClientsDto, userId: number): Promise<Client> {
    const existingClient = await this.clientRepository.findOne({
      where: {
        name: data.name,
        surname: data.surname,
        address: data.address,
        userId,
      },
    });

    if (existingClient) {
      throw new ConflictException(
        'Client with the same name, surname, and address already exists.',
      );
    }

    const client = this.clientRepository.create({
      ...data,
      userId,
    });

    return await this.clientRepository.save(client);
  }

  async editClient(clientId: number, data: EditClientDto, userId: number): Promise<Client> {
    const client = await this.clientRepository.findOne({ where: { clientsId: clientId, userId } });

    if (!client) {
      throw new NotFoundException('Client not found or access denied');
    }

    this.clientRepository.merge(client, data);

    return await this.clientRepository.save(client);
  }

  async getAllClients(userId: number): Promise<Client[]> {
    return await this.clientRepository.find({ where: { userId } });
  }

  async getClientById(clientId: number, userId: number): Promise<Client> {
    const client = await this.clientRepository.findOne({
      where: { clientsId: clientId, userId },
      relations: ['carpetReceptions'],
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return client;
  }

  async searchClients(
    userId: number,
    searchParams: { name?: string; surname?: string; address?: string },
  ): Promise<Client[]> {
    const whereClause: FindOptionsWhere<Client> = { userId };

    if (searchParams.name) whereClause.name = ILike(`%${searchParams.name}%`);
    if (searchParams.surname) whereClause.surname = ILike(`%${searchParams.surname}%`);
    if (searchParams.address) whereClause.address = ILike(`%${searchParams.address}%`);

    return await this.clientRepository.find({
      where: whereClause,
      relations: ['carpetReceptions'],
      order: { name: 'ASC' },
    });
  }

  async deleteClient(clientId: number, userId: number): Promise<void> {
    const client = await this.clientRepository.findOne({ where: { clientsId: clientId, userId } });

    if (!client) {
      throw new NotFoundException('Client not found or access denied');
    }

    await this.clientRepository.remove(client);
  }
}
