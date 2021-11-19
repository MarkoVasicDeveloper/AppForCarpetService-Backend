/* eslint-disable prettier/prettier */
import { Body, Controller, Post, SetMetadata, UseGuards } from "@nestjs/common";
import { MailerAllUserDto } from "dto/mailer/mailer.allUser.dto";
import { MailerDto } from "dto/mailer/mailer.dto";
import { RolleCheckerGard } from "src/rollecheckergard/rolle.checker.gatd";
import { UserMailerService } from "src/services/mailer/mailer.service";

@Controller('api/mail')

export class MailerController{
    constructor(private readonly mailerService: UserMailerService) {}

    @Post('welcome')
    @SetMetadata('allow_to_roles', ['administrator'])
    @UseGuards(RolleCheckerGard)
    async mailerWelcome(@Body() data: MailerDto) {
        return await this.mailerService.sendEmail(data)
    }

    @Post('allUser')
    @SetMetadata('allow_to_roles', ['administrator'])
    @UseGuards(RolleCheckerGard)
    async sendAlluser(@Body() data: MailerAllUserDto){
        return await this.mailerService.sendEmailAllUser(data)
    }
}