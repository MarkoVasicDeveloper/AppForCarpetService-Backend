import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  Inject,
  forwardRef,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CryptoUtil } from 'src/shared/utils/crypto.util';
import { Repository, QueryFailedError } from 'typeorm';

import { UserMailerService } from '../mailer/mailer.service';

import { AddUserDto } from './dto/add-user.dto';
import { EditUserDto } from './dto/edit-user.dto';
import { User } from './user.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(forwardRef(() => UserMailerService))
    private readonly mailerService: UserMailerService,
  ) {}

  async addUser(data: AddUserDto): Promise<User> {
    const hashedPassword = await CryptoUtil.hashPassword(data.password);

    const user = this.userRepository.create({
      name: data.name,
      surname: data.surname,
      email: data.email,
      city: data.city,
      address: data.address,
      phone: data.phone,
      passwordHash: hashedPassword,
    });

    try {
      const savedUser = await this.userRepository.save(user);

      await this.runBackgroundMailJob(savedUser.email);

      return savedUser;
    } catch (error: unknown) {
      if (error instanceof QueryFailedError) {
        const dbError = error.driverError as { errno?: number; code?: string };
        if (dbError.errno === 1062 || dbError.code === 'ER_DUP_ENTRY') {
          throw new ConflictException('Email address is already taken.');
        }
      }
      throw new InternalServerErrorException('Failed to register user to the database.', {
        cause: error,
      });
    }
  }

  async editUser(userId: number, data: EditUserDto): Promise<User> {
    const user = await this.getUserById(userId);

    if (data.address) user.address = data.address;
    if (data.city) user.city = data.city;
    if (data.name) user.name = data.name;
    if (data.phone) user.phone = data.phone;
    if (data.surname) user.surname = data.surname;

    return await this.userRepository.save(user);
  }

  async deleteUser(userId: number): Promise<void> {
    const result = await this.userRepository.delete(userId);

    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }
  }

  async getAllUser(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async getUserById(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }
    return user;
  }

  private async runBackgroundMailJob(email: string): Promise<void> {
    try {
      await this.mailerService.sendWelcomeEmail(email);
    } catch (mailError) {
      this.logger.error(`Failed to send welcome email to ${email}`, mailError as string);
    }
  }
}
