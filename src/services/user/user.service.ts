/* eslint-disable prettier/prettier */
import { InjectRepository } from "@nestjs/typeorm";
import { AddUserDto } from "dto/user/add.user.dto";
import { User } from "entities/User";
import { ApiResponse } from "src/misc/api.restonse";
import { Repository } from "typeorm";
import * as crypto from 'crypto';
import { EditUserDto } from "dto/user/edit.user.dto";
import { DeleteUserDto } from "dto/user/delete.user.dto";
import { DeleteUserByAdminDto } from "dto/user/delete.user.by.admin.dto";
import { UserEmailDto } from "dto/user/user.emai.dto";
import { RefreshToken } from "entities/RefreshToken";

export class UserService {
    constructor(@InjectRepository(User) private readonly userService: Repository<User>,
                @InjectRepository(RefreshToken) private readonly refreshToken: Repository<RefreshToken>
        ) {}

    async addUser (data: AddUserDto): Promise <User | ApiResponse> {

        try {
            const passwordString = crypto.createHash('sha512')
            passwordString.update(data.passwordHash)
            const passwordStringHash = passwordString.digest('hex').toString().toUpperCase()

            const user = new User()
            user.name = data.name
            user.surname = data.surname
            user.email = data.email
            user.city = data.city
            user.address = data.address
            user.phone = data.phone
            user.passwordHash = passwordStringHash

            const savedUser = await this.userService.save(user)

            return savedUser;
        } catch (error) {
            return new ApiResponse('error', -2001, 'Email is taken')
        }
    }

    async editUser (data: EditUserDto): Promise <User | ApiResponse> {
        const user = await this.userService.findOne({
            where: {
                email: data.email
            }
        })

        if (!user) {
            return new ApiResponse('error', -2001, 'User not found. Email is incorect')
        }

        if (data.address) {
            user.address = data.address
        }

        if(data.city) {
            user.city = data.city
        }

        if(data.name) {
            user.name = data.name
        }

        if(data.phone) {
            user.phone = data.phone
        }

        if(data.surname) {
            user.surname = data.surname
        }

        const savedUser = await this.userService.save(user)

        return savedUser;
    }

    async deleteUserHimself (data: DeleteUserDto): Promise <User | ApiResponse> {
        const user = await this.userService.findOne({
            where: {
                email: data.email
            }
        })

        if (!user) {
            return new ApiResponse('error', -1002, 'User with that email not exist')
        }

        const passwordString = crypto.createHash('sha512')
        passwordString.update(data.password)
        const passwordStringHash = passwordString.digest('hex').toString().toUpperCase()

        if (user.passwordHash !== passwordStringHash) {
            return new ApiResponse('error', -2002, 'Password is incorect')
        }

        const userDelete = await this.userService.remove(user)

        return userDelete;
    }

    async deleteUserByAdministrator (data: DeleteUserByAdminDto): Promise <User | ApiResponse> {
        const user = await this.userService.findOne({
            where: {
                email: data.email
            }
        })

        if (!user) {
            return new ApiResponse('error', -1002, 'User with that email not exist')
        }

        const userDelete = await this.userService.remove(user)

        return userDelete;
    }

    async getAllUser (): Promise <User[]> {
        return await this.userService.find()
    }

    async getUserByEmail (data: UserEmailDto): Promise<User> {
        const user = await this.userService.findOne({
            where: {
                email: data.email
            }
        })

        if (!user) {
            return null
        }

        return user;
    }

    async getUserById (id: number):Promise <User | null> {
        const user = await this.userService.findOne(id);

        if (!user) {
            return null;
        }

        return user;
    }

    async createToken (userId: number, expireAt: string, refreshToken: string) {
        const userRefreshToken = new RefreshToken();
        userRefreshToken.userId = userId;
        userRefreshToken.refreshToken = refreshToken;
        userRefreshToken.expireAt = expireAt as any;

        return await this.refreshToken.save(userRefreshToken)
    }

    async getUserToken (token: string): Promise<RefreshToken | ApiResponse> {
        const user = await this.refreshToken.findOne({
            refreshToken: token
        })

        if (!user) {
            return new ApiResponse('error', -3001, 'Token not found')
        }

        return user;
    }

    async invalidateToken(token: string):Promise <RefreshToken | ApiResponse> {
        const userToken = await this.refreshToken.findOne({
            refreshToken: token
        })

        if (!userToken) {
            return new ApiResponse('error', -3001, 'Token not found')
        }

        userToken.isValid = 0;

        await this.refreshToken.save(userToken);

        return await this.getUserToken(token)
    }

    async invalidateUserTokens (userId: number): Promise <(RefreshToken | ApiResponse)[]> {
        const userTokens = await this.refreshToken.find({
            userId: userId
        })

        const results = []

        for (const userToken of userTokens) {
            results.push(this.invalidateToken(userToken.refreshToken))
        }

        return results;
    }
}