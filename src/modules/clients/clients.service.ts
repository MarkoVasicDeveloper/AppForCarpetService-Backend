import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Clients } from 'src/modules/clients/clients.entity';
import { AddClientsDto } from 'src/modules/clients/dto/add-clients.dto';
import { EditClientDto } from 'src/modules/clients/dto/edit-client.dto';
import { GetClientByAddressDto } from 'src/modules/clients/dto/get-client-by-address.dto';
import { GetClientByNameDto } from 'src/modules/clients/dto/get-client-by-name.dto';
import { GetClientBySurnameDto } from 'src/modules/clients/dto/get-client-by-surname.dto';
import { ApiResponse } from 'src/shared/response/api-response';
import { Repository } from 'typeorm';

@Injectable()
export class ClientsService {
  constructor(@InjectRepository(Clients) private readonly clientsService: Repository<Clients>) {}

  async addClients(data: AddClientsDto, userId: number): Promise<Clients> {
    const existingClient = await this.clientsService.findOne({
      where: {
        name: data.name,
        surname: data.surname,
        address: data.address,
        userId: userId,
      },
    });

    if (existingClient) {
      return existingClient;
    }

    const clients = new Clients();
    clients.name = data.name;
    clients.surname = data.surname;
    clients.address = data.address;
    clients.userId = userId;
    clients.phone = data.phone;

    const savedClient = await this.clientsService.save(clients);

    return savedClient;
  }

  async editClient(data: EditClientDto, clientId: number): Promise<Clients | ApiResponse> {
    const client = await this.clientsService.findOne({ where: { clientsId: clientId } });

    if (!client) {
      return new ApiResponse('error', -4001, 'Client is not found');
    }

    if (data.name) {
      client.name = data.name;
    }

    if (data.surname) {
      client.surname = data.surname;
    }

    if (data.address) {
      client.address = data.address;
    }

    if (data.phone) {
      client.phone = data.phone;
    }

    const savedClient = await this.clientsService.save(client);

    return savedClient;
  }

  async getClientByNameSurnameAddress(
    data: AddClientsDto,
    userId: number,
  ): Promise<Clients | ApiResponse> {
    const client = await this.clientsService.findOne({
      where: {
        name: data.name,
        surname: data.surname,
        address: data.address,
        userId: userId,
      },
    });

    if (!client) {
      return new ApiResponse('error', -4001, 'Client not found');
    }

    return client;
  }

  async getAllClients(): Promise<Clients[]> {
    return await this.clientsService.find();
  }

  async getClientById(clientId: number, userId: number): Promise<Clients | ApiResponse | null> {
    const client = await this.clientsService.findOne({
      where: {
        clientsId: clientId,
        userId: userId,
      },
    });

    if (!client) {
      return new ApiResponse('error', -4001, 'Client is not found');
    }

    return await this.clientsService.findOne({ where: { clientsId: client.clientsId } });
  }

  async getClientByName(data: GetClientByNameDto): Promise<Clients | ApiResponse | null> {
    const client = await this.clientsService.findOne({
      where: {
        name: data.name,
      },
    });

    if (!client) {
      return new ApiResponse('error', -4001, 'Client is not found');
    }

    return await this.clientsService.findOne({
      where: { clientsId: client.clientsId },
      relations: ['carpetReceptions'],
    });
  }

  async getClientBySurname(data: GetClientBySurnameDto): Promise<Clients | ApiResponse | null> {
    const client = await this.clientsService.findOne({
      where: {
        surname: data.surname,
      },
    });

    if (!client) {
      return new ApiResponse('error', -4001, 'Client is not found');
    }

    return await this.clientsService.findOne({
      where: { clientsId: client.clientsId },
      relations: ['carpetReceptions'],
    });
  }

  async getClientByAddress(data: GetClientByAddressDto): Promise<Clients | ApiResponse | null> {
    const client = await this.clientsService.findOne({
      where: {
        address: data.address,
      },
    });

    if (!client) {
      return new ApiResponse('error', -4001, 'Client is not found');
    }

    return await this.clientsService.findOne({
      where: { clientsId: client.clientsId },
      relations: ['carpetReceptions'],
    });
  }

  async deleteClient(clientId: number): Promise<Clients | ApiResponse> {
    const client = await this.clientsService.findOne({ where: { clientsId: clientId } });

    if (!client) {
      return new ApiResponse('error', -4001, 'Client is not found');
    }

    const deleteClient = await this.clientsService.remove(client);

    return deleteClient;
  }

  async deleteAllClients(): Promise<Clients[]> {
    const allClients = await this.clientsService.find();

    const result = await this.clientsService.remove(allClients);

    return result;
  }
}
