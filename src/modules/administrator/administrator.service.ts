import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Administrator } from 'src/modules/administrator/administrator.entity';
import { AddAdministratorDto } from 'src/modules/administrator/dto/add-administrator.dto';
import { EditAdministratorDto } from 'src/modules/administrator/dto/edit-administrator.dto';
import {
  IAuthenticatableService,
  IAuthProfile,
} from 'src/modules/auth/types/authenticatable.interface';
import { Role } from 'src/shared/enums/role.enum';
import { CryptoUtil } from 'src/shared/utils/crypto.util';
import { Repository, QueryFailedError } from 'typeorm';

@Injectable()
export class AdministratorService implements IAuthenticatableService {
  constructor(
    @InjectRepository(Administrator)
    private readonly administratorRepository: Repository<Administrator>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async addAdministrator(data: AddAdministratorDto): Promise<Administrator> {
    const hashedPassword = await CryptoUtil.hashPassword(data.password);

    const admin = this.administratorRepository.create({
      username: data.username,
      passwordHash: hashedPassword,
    });

    try {
      return await this.administratorRepository.save(admin);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const dbError = error.driverError as { errno?: number; code?: string };
        if (dbError.errno === 1062 || dbError.code === 'ER_DUP_ENTRY') {
          throw new ConflictException('Administrator with that username already exists');
        }
      }
      throw new InternalServerErrorException('Failed to add administrator to the database.', {
        cause: error,
      });
    }
  }

  async editAdmin(id: number, data: EditAdministratorDto): Promise<Administrator> {
    const admin = await this.administratorRepository.findOne({
      where: { administratorId: id },
    });

    if (!admin) {
      throw new NotFoundException('Administrator not found');
    }

    const isPasswordCorrect = await CryptoUtil.comparePassword(data.password, admin.passwordHash);
    if (!isPasswordCorrect) {
      throw new BadRequestException('Incorrect current password');
    }

    if (data.username) {
      admin.username = data.username;
    }

    if (data.newPassword) {
      admin.passwordHash = await CryptoUtil.hashPassword(data.newPassword);
    }

    try {
      const updatedAdmin = await this.administratorRepository.save(admin);

      if (data.username || data.newPassword) {
        this.eventEmitter.emit('administrator.credentials.changed', { adminId: id });
      }

      return updatedAdmin;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const dbError = error.driverError as { errno?: number; code?: string };
        if (dbError.errno === 1062 || dbError.code === 'ER_DUP_ENTRY') {
          throw new ConflictException('This username is already taken');
        }
      }
      throw new InternalServerErrorException('Failed to update administrator.', { cause: error });
    }
  }

  async deleteAdmin(id: number): Promise<void> {
    const admin = await this.administratorRepository.findOne({
      where: { administratorId: id },
    });

    if (!admin) {
      throw new NotFoundException('Administrator not found');
    }

    this.eventEmitter.emit('administrator.deleted', { adminId: id });

    await this.administratorRepository.remove(admin);
  }

  async getAllAdmin(): Promise<Administrator[]> {
    return await this.administratorRepository.find();
  }

  async getAdminByUsername(data: { username: string }): Promise<Administrator | null> {
    return await this.administratorRepository.findOne({
      where: { username: data.username },
    });
  }

  async getAdminById(id: number): Promise<Administrator> {
    const admin = await this.administratorRepository.findOne({
      where: { administratorId: id },
    });

    if (!admin) {
      throw new NotFoundException('Administrator not found');
    }

    return admin;
  }

  async authenticateIdentity(identity: string): Promise<IAuthProfile | null> {
    const admin = await this.getAdminByUsername({ username: identity });
    if (!admin) return null;

    return {
      id: admin.administratorId,
      identity: admin.username,
      passwordHash: admin.passwordHash,
      role: Role.ADMINISTRATOR,
    };
  }
}
