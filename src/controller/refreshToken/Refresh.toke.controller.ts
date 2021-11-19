/* eslint-disable prettier/prettier */
import { Controller, Get, Param, SetMetadata, UseGuards } from "@nestjs/common";
import { RefreshToken } from "entities/RefreshToken";
import { RolleCheckerGard } from "src/rollecheckergard/rolle.checker.gatd";
import { RefreshTokenService } from "src/services/refreshToken/refreshToken";

@Controller('api/refreshToken')

export class RefreshTokenController {
    constructor(private readonly refreshService: RefreshTokenService) { }

    @Get('invalid/:id')
    @UseGuards(RolleCheckerGard)
    @SetMetadata('allow_to_roles', ['administrator'])
    async invalidAllUserToken(@Param('id') userId: number):Promise<RefreshToken[]> {
        return await this.refreshService.invalidAllToken(userId);
    }
}