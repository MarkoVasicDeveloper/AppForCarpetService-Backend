import { Injectable, InternalServerErrorException, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import * as nodemailer from 'nodemailer';

import { UserService } from '../../modules/user/user.service';

import { MailerAllUserDto } from './dto/mailer-all-user.dto';
import { MailerDto } from './dto/mailer.dto';

@Injectable()
export class UserMailerService implements OnModuleInit {
  private readonly logger = new Logger(UserMailerService.name);
  private oauth2Client!: OAuth2Client;
  private fromEmail = 'washersoftware@gmail.com';

  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    const redirectUrl = this.configService.get<string>('GOOGLE_REDIRECT_URL');
    const refreshToken = this.configService.get<string>('GOOGLE_REFRESH_TOKEN');

    if (clientId && clientSecret && refreshToken) {
      this.oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUrl);
      this.oauth2Client.setCredentials({ refresh_token: refreshToken });
    } else {
      this.logger.warn('Mailer OAuth2 credentials missing in configuration.');
    }
  }

  private async createTransporter(): Promise<nodemailer.Transporter> {
    try {
      const res = await this.oauth2Client.getAccessToken();
      const accessToken = res.token ?? undefined;

      return nodemailer.createTransport({
        service: 'Gmail',
        port: 587,
        secure: false,
        auth: {
          type: 'OAuth2',
          user: this.fromEmail,
          clientId: this.configService.get<string>('GOOGLE_CLIENT_ID'),
          clientSecret: this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
          refreshToken: this.configService.get<string>('GOOGLE_REFRESH_TOKEN'),
          accessToken: accessToken,
        },
        tls: { rejectUnauthorized: false },
      });
    } catch (error) {
      this.logger.error('Failed to create Nodemailer OAuth2 transporter', error.stack);
      throw new InternalServerErrorException('Email service authentication failed.');
    }
  }

  async sendEmail(data: MailerDto): Promise<{ messageId: string }> {
    const transport = await this.createTransporter();

    const mailOptions = {
      from: `"Washer App" <${this.fromEmail}>`,
      to: data.email,
      subject: 'Obaveštenje sa Washer aplikacije',
      html: data.text,
    };

    try {
      const result = await transport.sendMail(mailOptions);
      this.logger.log(`Email successfully sent to ${data.email}`);
      return { messageId: result.messageId };
    } catch (error) {
      this.logger.error(`Failed to send email to ${data.email}`, error.stack);
      throw new InternalServerErrorException(`Could not send email to ${data.email}`);
    }
  }

  async sendEmailAllUser(
    data: MailerAllUserDto,
  ): Promise<{ total: number; successful: number; failed: number }> {
    const allUsers = await this.userService.getAllUser();
    const transport = await this.createTransporter();

    const mailPromises = allUsers.map((user) => {
      const mailOptions = {
        from: `"Washer App" <${this.fromEmail}>`,
        to: user.email,
        subject: 'Obaveštenje za sve korisnike - Washer',
        html: data.data,
      };
      return transport.sendMail(mailOptions);
    });

    const results = await Promise.allSettled(mailPromises);

    let successful = 0;
    let failed = 0;

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successful++;
      } else {
        failed++;
        this.logger.error(`Bulk send failed for user: ${allUsers[index].email}`, result.reason);
      }
    });

    this.logger.log(`Bulk mail completed. Success: ${successful}, Failed: ${failed}`);
    return { total: allUsers.length, successful, failed };
  }

  async sendWelcomeEmail(email: string): Promise<void> {
    const mailContent = new MailerDto();
    mailContent.email = email;
    mailContent.text = `
      <div style="text-align: center; font-family: sans-serif; padding: 20px;">
        <h1 style="color: #fec400">Dobro došli!</h1>
        <p style="margin-bottom: 1rem; font-size: 16px;">
          Ovaj softver je besplatan i uvek će biti! 
        </p> 
        <p>
          Klikom na dugme ispod idete direktno na stranicu za logovanje:
        </p>
        <a href="https://washersoftware.com/#/login" style="background-color: #fec400; color: #000; padding: 10px 20px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block; margin-top: 10px;">Log In</a>
      </div>`;

    await this.sendEmail(mailContent);
  }
}
