import { randomUUID } from 'crypto';

import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IAuthenticatableService,
  IAuthProfile,
} from 'src/modules/auth/types/authenticatable.interface';
import { Role } from 'src/shared/enums/role.enum';
import { CryptoUtil } from 'src/shared/utils/crypto.util';
import { Repository, QueryFailedError } from 'typeorm';

import { AddUserDto } from './dto/add-user.dto';
import { EditUserDto } from './dto/edit-user.dto';
import { User } from './user.entity';

@Injectable()
export class UserService implements IAuthenticatableService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async addUser(data: AddUserDto): Promise<User> {
    const hashedPassword = await CryptoUtil.hashPassword(data.password);
    const token = randomUUID();

    const user = this.userRepository.create({
      name: data.name,
      surname: data.surname,
      email: data.email,
      city: data.city,
      address: data.address,
      phone: data.phone,
      passwordHash: hashedPassword,
      isVerified: false,
      verificationToken: token,
    });

    try {
      const savedUser = await this.userRepository.save(user);

      this.eventEmitter.emit('user.registered', {
        email: savedUser.email,
        name: `${savedUser.name} ${savedUser.surname}`,
        token: savedUser.verificationToken,
      });

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

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    if (data.address) user.address = data.address;
    if (data.city) user.city = data.city;
    if (data.name) user.name = data.name;
    if (data.phone) user.phone = data.phone;
    if (data.surname) user.surname = data.surname;

    this.eventEmitter.emit('user.credentials.changed', { userId });
    return await this.userRepository.save(user);
  }

  async deleteUser(userId: number): Promise<void> {
    this.eventEmitter.emit('user.deleted', { userId });
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

  async verifyAccount(token: string): Promise<{ success: boolean; message: string }> {
    if (!token) {
      throw new BadRequestException('Verification token is required.');
    }

    const user = await this.userRepository.findOne({ where: { verificationToken: token } });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token.');
    }

    user.isVerified = true;
    user.verificationToken = null;
    await this.userRepository.save(user);

    return { success: true, message: 'Account verified successfully.' };
  }

  async authenticateIdentity(identity: string): Promise<IAuthProfile | null> {
    const user = await this.getUserByEmail(identity);
    if (!user) return null;

    return {
      id: user.userId,
      identity: user.email,
      passwordHash: user.passwordHash,
      role: Role.USER,
      isVerified: user.isVerified,
    };
  }
}
