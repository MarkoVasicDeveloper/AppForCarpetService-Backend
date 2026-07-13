import * as fs from 'fs';

import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as handlebars from 'handlebars';
import * as nodemailer from 'nodemailer';

import { NotificationService } from './notification.service';

jest.mock('nodemailer');
jest.mock('fs');
jest.mock('handlebars');

describe('NotificationService', () => {
  let service: NotificationService;
  let mockTransporter: { sendMail: jest.Mock };

  beforeEach(async () => {
    process.env.NODE_ENV = 'test';
    process.env.SMTP_HOST = 'localhost';
    process.env.SMTP_PORT = '2525';
    process.env.SMTP_USER = 'user';
    process.env.SMTP_PASS = 'pass';

    mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({ messageId: '12345' }),
    };
    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);

    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationService],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    service.onModuleInit();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should log a warning in production if SMTP credentials are missing', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.SMTP_USER;
      delete process.env.SMTP_PASS;

      const loggerWarnSpy = jest.spyOn(service['logger'], 'warn');

      service.onModuleInit();

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('SMTP authentication credentials are missing'),
      );
    });
  });

  describe('sendEmail', () => {
    const to = 'test@example.com';
    const subject = 'Hello Test';
    const templateName = 'welcome';
    const context = { name: 'Marko' };

    it('should successfully compile template and send email', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue('<h1>Hello {{name}}</h1>');

      const mockCompiledTemplate = jest.fn().mockReturnValue('<h1>Hello Marko</h1>');
      jest
        .spyOn(handlebars, 'compile')
        .mockReturnValue(mockCompiledTemplate as unknown as handlebars.TemplateDelegate);

      const result = await service.sendEmail(to, subject, templateName, context);

      expect(fs.existsSync).toHaveBeenCalled();
      expect(fs.readFileSync).toHaveBeenCalled();
      expect(handlebars.compile).toHaveBeenCalledWith('<h1>Hello {{name}}</h1>');
      expect(mockCompiledTemplate).toHaveBeenCalledWith(context);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: '"Washer App" <noreply@washersoftware.com>',
        to,
        subject,
        html: '<h1>Hello Marko</h1>',
      });

      expect(result).toEqual({ success: true, message: 'Email dispatched successfully.' });
    });

    it('should throw InternalServerErrorException if template does not exist', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await expect(service.sendEmail(to, subject, templateName, context)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockTransporter.sendMail).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if nodemailer fails', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue('some template');

      const mockCompiledTemplate = jest.fn().mockReturnValue('html');
      jest
        .spyOn(handlebars, 'compile')
        .mockReturnValue(mockCompiledTemplate as unknown as handlebars.TemplateDelegate);

      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP Timeout'));

      await expect(service.sendEmail(to, subject, templateName, context)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('sendPushNotification', () => {
    it('should log the push notification details without throwing errors', async () => {
      const loggerLogSpy = jest.spyOn(service['logger'], 'log');

      await expect(
        service.sendPushNotification('user123', 'Title', 'Message'),
      ).resolves.not.toThrow();

      expect(loggerLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Notification dispatched to User [user123]'),
      );
    });
  });
});
