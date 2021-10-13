/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AddClientsDto } from "dto/clients/add.clients.dto";
import { EditClientDto } from "dto/clients/edit.client.dto";
import { GetClientByAddressDto } from "dto/clients/get.client.by.address.dto";
import { GetClientByNameDto } from "dto/clients/get.client.by.name.dto";
import { GetClientBySurnameDto } from "dto/clients/get.client.by.surname.dto";
import { Clients } from "entities/Clients";
import { ApiResponse } from "src/misc/api.restonse";
import { Repository } from "typeorm";

@Injectable()
export class ClientsService {
    constructor(@InjectRepository(Clients) private readonly clientsService: Repository<Clients>) { }

    async addClients (data: AddClientsDto):Promise<Clients> {
        
        const existingClient = await this.clientsService.findOne({
            where: {
                name: data.name,
                surname: data.surname,
                address: data.address
            }
        })

        if(existingClient) {
            return existingClient;
        }

        const clients = new Clients();
        clients.name = data.name;
        clients.surname = data.surname;
        clients.address = data.address;

        const savedClient = await this.clientsService.save(clients);

        return savedClient;

        
    }

    async editClient(data: EditClientDto, clientId: number):Promise <Clients | ApiResponse> {
        const client = await this.clientsService.findOne(clientId);

        if (!client) {
            return new ApiResponse('error', -4001, 'Client is not found')
        }

        if(data.name) {
            client.name = data.name;
        }

        if(data.surname) {
            client.surname = data.surname;
        }

        if(data.address) {
            client.address = data.address;
        }

        const savedClient = await this.clientsService.save(client);

        return savedClient;
    }

    async getClientByNameSurnameAddress(data: AddClientsDto):Promise <Clients | ApiResponse> {
        const client = await this.clientsService.findOne({
            where: {
                name: data.name,
                surname: data.surname,
                address: data.address
            }
        })

        if(!client) {
            return new ApiResponse('error', -4001, 'Client not found')
        }

        return client;
    }

    async getAllClients ():Promise <Clients[]> {
        return await this.clientsService.find()
    }

    async getClientById (clientId: number):Promise <Clients | ApiResponse> {
        const client = await this.clientsService.findOne(clientId);

        if (!client) {
            return new ApiResponse('error', -4001, 'Client is not found');
        }

        return await this.clientsService.findOne(client.clientsId, {
            relations: ['carpetReceptions', 'carpetReceptions.carpetImages']
        });
    }

    async getClientByName (data: GetClientByNameDto):Promise<Clients | ApiResponse> {
        const client = await this.clientsService.findOne({
            where: {
                name: data.name
            }
        })

        if (!client) {
            return new ApiResponse('error', -4001, 'Client is not found');
        }

        return await this.clientsService.findOne(client.clientsId, {
            relations: ['carpetReceptions', 'carpetReceptions.carpetImages']
        });
    }

    async getClientBySurname (data: GetClientBySurnameDto):Promise<Clients | ApiResponse> {
        const client = await this.clientsService.findOne({
            where: {
                surname: data.surname
            }
        })

        if (!client) {
            return new ApiResponse('error', -4001, 'Client is not found');
        }

        return await this.clientsService.findOne(client.clientsId, {
            relations: ['carpetReceptions', 'clients.carpetReceptions.carpetImages']
        });
    }

    async getClientByAddress (data: GetClientByAddressDto):Promise<Clients | ApiResponse> {
        const client = await this.clientsService.findOne({
            where: {
                address: data.address
            }
        })

        if (!client) {
            return new ApiResponse('error', -4001, 'Client is not found');
        }

        return await this.clientsService.findOne(client.clientsId, {
            relations: ['carpetReceptions', 'carpetReceptions.carpetImages']
        });
    }

    async deleteClient (clientId: number):Promise <Clients | ApiResponse> {
        const client = await this.clientsService.findOne(clientId);

        if (!client) {
            return new ApiResponse('error', -4001, 'Client is not found');
        }

        const deleteClient = await this.clientsService.remove(client)

        return deleteClient;
    }

    async deleteAllClients (): Promise <Clients[]> {
        const allClients = await this.clientsService.find();

        const result = [];

        for (const client of allClients) {
            const deleteClient = await this.clientsService.remove(client)
            result.push(deleteClient)
        }

        return result;
    }
}