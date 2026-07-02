import { Body, Controller, Post, SetMetadata, UseGuards } from '@nestjs/common';
import { MailerAllUserDto } from 'src/modules/mailer/dto/mailer-all-user.dto';
import { MailerDto } from 'src/modules/mailer/dto/mailer.dto';
import { RoleCheckerGuard } from 'src/shared/guards/role-checker.guard';

import { UserMailerService } from './mailer.service';

@Controller('api/mail')
export class MailerController {
  constructor(private readonly mailerService: UserMailerService) {}

  @Post('welcome')
  @SetMetadata('allow_to_roles', ['administrator'])
  @UseGuards(RoleCheckerGuard)
  async mailerWelcome(@Body() data: MailerDto) {
    return await this.mailerService.sendEmail(data);
  }

  @Post('allUser')
  @SetMetadata('allow_to_roles', ['administrator'])
  @UseGuards(RoleCheckerGuard)
  async sendAlluser(@Body() data: MailerAllUserDto) {
    return await this.mailerService.sendEmailAllUser(data);
  }
}
