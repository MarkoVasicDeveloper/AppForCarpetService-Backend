/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-empty-function */

import { InjectRepository } from "@nestjs/typeorm";
import { AddAdministratorDto } from "dto/administrator/add.administrator.dto";
import { Administrator } from "entities/Administrator";
import { ApiResponse } from "misc/api.restonse";
import { Repository } from "typeorm";
import * as crypto from 'crypto';
import { EditAdministratorDto } from "dto/administrator/edit.administrator.dto";
import { DeleteAdministratorDto } from "dto/administrator/delete.administrator.dto";
import { UsernameAdministratorDto } from "dto/administrator/username.administrator.dto";

/* eslint-disable prettier/prettier */
export class AdministratorService {
    constructor(@InjectRepository(Administrator) private readonly administratorService: Repository<Administrator>) {}

    async addAdministrator(data: AddAdministratorDto): Promise <Administrator | ApiResponse> {

        try {
            const passwordString = crypto.createHash('sha512')
            passwordString.update(data.password)
            const passwordHashString = passwordString.digest('hex').toString().toLocaleUpperCase()
    
            const admin = new Administrator()
            admin.username = data.username
            admin.passwordHash = passwordHashString
    
            const savedAdmin = await this.administratorService.save(admin)
    
            return savedAdmin;
        } catch (error) {
            return new ApiResponse('error', -1001, 'Administrator not saved. Probably username is taken')
        }
    }

    async editAdmin (data: EditAdministratorDto): Promise <Administrator | ApiResponse> {
        const admin = await this.administratorService.findOne({
            where: {
                username: data.username
            }
        })

        if(!admin) {
            return new ApiResponse('error', -1002, 'Administrator with that username not exist')
        }

        const passwordString = crypto.createHash('sha512')
        passwordString.update(data.password)
        const passwordStringHash = passwordString.digest('hex').toString().toLocaleUpperCase()

        if (passwordStringHash !== admin.passwordHash) {
            return new ApiResponse('error', -1003, 'Password incorect')
        }

        const passwordStringNew = crypto.createHash('sha512')
        passwordStringNew.update(data.newPassword)
        const passwordStringHashNew = passwordStringNew.digest('hex').toString().toLocaleUpperCase()

        admin.passwordHash = passwordStringHashNew

        const savedAdmin = await this.administratorService.save(admin)

        return savedAdmin;
    }

    async deleteAdmin (data: DeleteAdministratorDto): Promise <Administrator | ApiResponse> {
        const admin = await this.administratorService.findOne({
            where: {
                username: data.username
            }
        })

        if (!admin) {
            return new ApiResponse('error', -1002, 'Administrator with that username not exist')
        }

        const deleteAdmin = await this.administratorService.remove(admin);

        return deleteAdmin;
    }

    async getAllAdmin (): Promise <Administrator[]> {
        return await this.administratorService.find()
    }

    async getAdminByUsername (data: UsernameAdministratorDto): Promise<Administrator | ApiResponse> {
        const admin = await this.administratorService.findOne({
            where: {
                username: data.username
            }
        })

        if (!admin) {
            return new ApiResponse('error', -1002, 'Administrator with that username not exist')
        }

        return admin;
    }
}