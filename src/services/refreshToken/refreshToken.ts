/* eslint-disable prettier/prettier */
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RefreshToken } from "entities/RefreshToken";
import { Repository } from "typeorm";

@Injectable()

export class RefreshTokenService {
    constructor(@InjectRepository(RefreshToken) private readonly refreshService: Repository<RefreshToken>) { }

    async invalidAllToken (userId: number): Promise<RefreshToken[]> {
        const userToken = await this.refreshService.find({
            where: {
                userId: userId
            }
        });

        for (const token of userToken) {
            token.isValid = 0;
            await this.refreshService.save(token);
        }

        return userToken;
    }
}