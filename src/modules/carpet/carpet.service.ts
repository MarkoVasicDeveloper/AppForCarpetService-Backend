import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, QueryFailedError, Repository } from 'typeorm';

import { Carpet } from './carpet.entity';
import { AddCarpetDto } from './dto/add-carpet.dto';
import { EditCarpetDto } from './dto/edit-carpet.dto';

@Injectable()
export class CarpetService {
  constructor(
    @InjectRepository(Carpet)
    private readonly carpetRepository: Repository<Carpet>,
  ) {}

  async addCarpet(data: AddCarpetDto, userId: number, creatorWorkerId?: number): Promise<Carpet> {
    const finalWorkerId = creatorWorkerId ? creatorWorkerId : data.workerId;

    const carpet = this.carpetRepository.create({
      carpetReceptionUser: data.carpetReception,
      width: data.width,
      height: data.height,
      price: data.price,
      workerId: finalWorkerId,
      deliveryTime: data.deliveryDate,
      userId: userId,
      clientsId: data.clientsId,
    });

    this.calculateFinancials(carpet);

    try {
      return await this.carpetRepository.save(carpet);
    } catch (error: unknown) {
      if (error instanceof QueryFailedError) {
        const dbError = error.driverError as { errno?: number; code?: string };
        if (dbError.errno === 1452 || dbError.code === 'ER_NO_REFERENCED_ROW_2') {
          throw new BadRequestException(
            'Provided Client ID, Worker ID, or User ID does not exist.',
          );
        }
      }
      throw new InternalServerErrorException('Failed to save carpet to the database.');
    }
  }

  async editCarpet(carpetId: number, data: EditCarpetDto, userId: number): Promise<Carpet> {
    const carpet = await this.carpetRepository.findOne({
      where: { carpetId, userId },
    });

    if (!carpet) {
      throw new NotFoundException(`Carpet with ID ${carpetId} for this user not found.`);
    }

    if (data.carpetReception !== undefined) carpet.carpetReceptionUser = data.carpetReception;
    if (data.width !== undefined) carpet.width = data.width;
    if (data.height !== undefined) carpet.height = data.height;
    if (data.price !== undefined) carpet.price = data.price;
    if (data.workerId !== undefined) carpet.workerId = data.workerId;
    if (data.deliveryDate !== undefined) carpet.deliveryTime = data.deliveryDate;

    this.calculateFinancials(carpet);

    return await this.carpetRepository.save(carpet);
  }

  async getAllCarpetsByDate(dateString: string, userId: number): Promise<Carpet[]> {
    const formattedDate = dateString.split('T')[0];

    return await this.carpetRepository.find({
      where: {
        deliveryTime: formattedDate,
        userId,
      },
    });
  }

  async getAllCarpetsByClientId(carpetReceptionUser: number, userId: number): Promise<Carpet[]> {
    return await this.carpetRepository.find({
      where: {
        carpetReceptionUser,
        userId,
      },
    });
  }

  async getCarpetAnalysisStats(
    userId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<{ surface: number; forPay: number }> {
    const result = await this.carpetRepository
      .createQueryBuilder('carpet')
      .select('SUM(COALESCE(carpet.carpetSurface, 0))', 'surface')
      .addSelect('SUM(COALESCE(carpet.forPayment, 0))', 'forPay')
      .where('carpet.userId = :userId', { userId })
      .andWhere('carpet.timeAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getRawOne();

    return {
      surface: Number(result?.surface || 0),
      forPay: Number(result?.forPay || 0),
    };
  }

  async getCarpetsForAnalysis(userId: number, startDate: Date, endDate: Date): Promise<Carpet[]> {
    return await this.carpetRepository.find({
      where: {
        userId,
        timeAt: Between(startDate, endDate),
      },
      order: { timeAt: 'DESC' },
    });
  }

  private calculateFinancials(carpet: Carpet): void {
    const width = Number(carpet.width) || 0;
    const height = Number(carpet.height) || 0;
    const price = Number(carpet.price) || 0;

    carpet.carpetSurface = Number((width * height).toFixed(2));
    carpet.forPayment = Number((carpet.carpetSurface * price).toFixed(2));
  }
}
