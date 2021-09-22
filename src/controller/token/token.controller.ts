/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Controller, Post } from "@nestjs/common";
import { AdministratorService } from "src/services/administrator/administrator.service";
import { UserService } from "src/services/user/user.service";

@Controller('api')
export class TokenController {
    constructor(private readonly administratorService: AdministratorService,
                private readonly userService: UserService) { }

    @Post('user/refresh')
    userTokenRefresh() {
        
    }
}