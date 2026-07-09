import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { RoleCheckerGuard } from 'src/shared/guards/role-checker.guard';

import { MailerAllUserDto } from './dto/mailer-all-user.dto';
import { MailerDto } from './dto/mailer.dto';
import { UserMailerService } from './mailer.service';

@Controller('mailer')
@UseGuards(RoleCheckerGuard)
@Roles(Role.ADMINISTRATOR)
export class MailerController {
  constructor(private readonly mailerService: UserMailerService) {}

  @Post('welcome')
  async mailerWelcome(@Body() data: MailerDto) {
    return await this.mailerService.sendEmail(data);
  }

  @Post('all-users')
  async sendAllUsers(@Body() data: MailerAllUserDto) {
    return await this.mailerService.sendEmailAllUser(data);
  }
}
