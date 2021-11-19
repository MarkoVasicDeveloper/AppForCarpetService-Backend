/* eslint-disable prettier/prettier */
import { Injectable } from "@nestjs/common";
import { MailerAllUserDto } from "dto/mailer/mailer.allUser.dto";
import { MailerDto } from "dto/mailer/mailer.dto";
import { google } from "googleapis";
import * as nodemailer from 'nodemailer';
import { UserService } from "../user/user.service";

@Injectable()

export class UserMailerService {
    constructor(private readonly userService: UserService) {}
    async sendEmail(data: MailerDto) {
        const CLIENT_ID = '109511830825-2vafnmnkaoc03rci02vqmm5q3dqhbvk4.apps.googleusercontent.com'
        const CLIENT_SECRET = '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'
        const REDIRECT_URL = 'https://developers.google.com/oauthplayground';
        const REFRESH_TOKEN = '1//04vJ75ZqOagwxCgYIARAAGAQSNwF-L9IrXQRBy4W-Ybj_jIh9sTmdLB0Wx3J0OsHZ-KMi2qzekw00NjToIrFIWqNBIOze1hUra88';

        const Oauth2 = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
        Oauth2.setCredentials({refresh_token:REFRESH_TOKEN});

        try {
            const accessToken = await Oauth2.getAccessToken();

            const transtort = nodemailer.createTransport({
                service :'Gmail', // Hardcode It
                port: 587, // Hardcode It
                secure: false, 
                auth: {
                    type: 'OAuth2',
                    user: 'washersoftware@gmail.com',
                    clientId: CLIENT_ID,
                    clientSecret: CLIENT_SECRET,
                    refreshToken: REFRESH_TOKEN,
                    accessToken: accessToken as any
                },
                tls: { rejectUnauthorized: false }
            })

            const mailerOptions = {
                from: 'washersoftware@google.com',
                to: data.email,
                subject: 'Washer <washersoftware@google.com>',
                encoding: 'UTF-8',
                html: data.text
            }

            const result = await transtort.sendMail(mailerOptions)
            return result;
        } catch (error) {
            return error;
        }
    }

    async sendEmailAllUser(data: MailerAllUserDto) {
        const allUser = await this.userService.getAllUser();

        const CLIENT_ID = '109511830825-2vafnmnkaoc03rci02vqmm5q3dqhbvk4.apps.googleusercontent.com'
        const CLIENT_SECRET = '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'
        const REDIRECT_URL = 'https://developers.google.com/oauthplayground';
        const REFRESH_TOKEN = '1//04vJ75ZqOagwxCgYIARAAGAQSNwF-L9IrXQRBy4W-Ybj_jIh9sTmdLB0Wx3J0OsHZ-KMi2qzekw00NjToIrFIWqNBIOze1hUra88';

        const Oauth2 = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
        Oauth2.setCredentials({refresh_token:REFRESH_TOKEN});

        for(const user of allUser){
            try {
                const accessToken = await Oauth2.getAccessToken();
    
                const transtort = nodemailer.createTransport({
                    service :'Gmail', // Hardcode It
                    port: 587, // Hardcode It
                    secure: false, 
                    auth: {
                        type: 'OAuth2',
                        user: 'washersoftware@gmail.com',
                        clientId: CLIENT_ID,
                        clientSecret: CLIENT_SECRET,
                        refreshToken: REFRESH_TOKEN,
                        accessToken: accessToken as any
                    },
                    tls: { rejectUnauthorized: false }
                })
    
                const mailerOptions = {
                    from: 'washersoftware@google.com',
                    to: user.email,
                    subject: 'Washer <washersoftware@google.com>',
                    encoding: 'UTF-8',
                    html: data.data
                }
    
                const result = await transtort.sendMail(mailerOptions)
                return result;
            } catch (error) {
                return error;
            }
    
        }
    }
}