import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import * as nodemailer from 'nodemailer';
import { MailerAllUserDto } from 'src/modules/mailer/dto/mailer-all-user.dto';
import { MailerDto } from 'src/modules/mailer/dto/mailer.dto';

import { UserService } from '../../modules/user/user.service';

@Injectable()
export class UserMailerService {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  async sendEmail(data: MailerDto) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    const redirectUrl = this.configService.get<string>('GOOGLE_REDIRECT_URL');
    const refreshToken = this.configService.get<string>('GOOGLE_REFRESH_TOKEN');

    const Oauth2 = new google.auth.OAuth2(clientId, clientSecret, redirectUrl);
    Oauth2.setCredentials({ refresh_token: refreshToken });

    try {
      const res = await Oauth2.getAccessToken();
      const accessToken = res.token ?? undefined;

      const transport = nodemailer.createTransport({
        service: 'Gmail',
        port: 587,
        secure: false,
        auth: {
          type: 'OAuth2',
          user: 'washersoftware@gmail.com',
          clientId: clientId,
          clientSecret: clientSecret,
          refreshToken: refreshToken,
          accessToken: accessToken,
        },
        tls: { rejectUnauthorized: false },
      });

      const mailerOptions = {
        from: 'washersoftware@google.com',
        to: data.email,
        subject: 'Washer <washersoftware@google.com>',
        encoding: 'UTF-8',
        html: data.text,
      };

      const result = await transport.sendMail(mailerOptions);
      return result;
    } catch (error) {
      return error;
    }
  }

  async sendEmailAllUser(data: MailerAllUserDto) {
    const allUser = await this.userService.getAllUser();

    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    const redirectUrl = this.configService.get<string>('GOOGLE_REDIRECT_URL');
    const refreshToken = this.configService.get<string>('GOOGLE_REFRESH_TOKEN');

    const Oauth2 = new google.auth.OAuth2(clientId, clientSecret, redirectUrl);
    Oauth2.setCredentials({ refresh_token: refreshToken });

    try {
      const res = await Oauth2.getAccessToken();
      const accessToken = res.token ?? undefined;

      const transport = nodemailer.createTransport({
        service: 'Gmail',
        port: 587,
        secure: false,
        auth: {
          type: 'OAuth2',
          user: 'washersoftware@gmail.com',
          clientId: clientId,
          clientSecret: clientSecret,
          refreshToken: refreshToken,
          accessToken: accessToken,
        },
        tls: { rejectUnauthorized: false },
      });

      const results: unknown[] = [];

      for (const user of allUser) {
        try {
          const mailerOptions = {
            from: 'washersoftware@google.com',
            to: user.email,
            subject: 'Washer <washersoftware@google.com>',
            encoding: 'UTF-8',
            html: data.data,
          };

          const result = await transport.sendMail(mailerOptions);
          results.push({ email: user.email, status: 'success', result });
        } catch (mailError) {
          results.push({ email: user.email, status: 'error', error: mailError });
        }
      }

      return results;
    } catch (oauthError) {
      return oauthError;
    }
  }
}
