import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Administrator } from 'src/modules/administrator/administrator.entity';
import { AddAdministratorDto } from 'src/modules/administrator/dto/add-administrator.dto';
import { EditAdministratorDto } from 'src/modules/administrator/dto/edit-administrator.dto';
import { CryptoUtil } from 'src/shared/utils/crypto.util';
import { Repository, QueryFailedError } from 'typeorm';

@Injectable()
export class AdministratorService {
  constructor(
    @InjectRepository(Administrator)
    private readonly administratorRepository: Repository<Administrator>,
  ) {}

  async addAdministrator(data: AddAdministratorDto): Promise<Administrator> {
    const admin = new Administrator();
    admin.username = data.username;
    admin.passwordHash = await CryptoUtil.hashPassword(data.password);

    try {
      return await this.administratorRepository.save(admin);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const dbError = error.driverError as { errno?: number; code?: string };
        if (dbError.errno === 1062 || dbError.code === 'ER_DUP_ENTRY') {
          throw new ConflictException('Administrator with that username already exists');
        }
      }
      throw new InternalServerErrorException('Failed to add administrator to the database.');
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
      return await this.administratorRepository.save(admin);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const dbError = error.driverError as { errno?: number; code?: string };
        if (dbError.errno === 1062 || dbError.code === 'ER_DUP_ENTRY') {
          throw new ConflictException('This username is already taken');
        }
      }
      throw new InternalServerErrorException('Failed to update administrator.');
    }
  }

  async deleteAdmin(id: number): Promise<void> {
    const admin = await this.administratorRepository.findOne({
      where: { administratorId: id },
    });

    if (!admin) {
      throw new NotFoundException('Administrator not found');
    }

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
}
