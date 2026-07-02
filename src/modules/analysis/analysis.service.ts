import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AnalysisInfo } from 'src/modules/analysis/utils/analysis-info';
import { AnalysisReportInfo } from 'src/modules/analysis/utils/analysis-report.info';
import { ClientsReport } from 'src/modules/analysis/utils/clients-report';
import { NumberOfCarpetReport } from 'src/modules/analysis/utils/number-of-carpet-report';
import { SurfacePayReport } from 'src/modules/analysis/utils/surface-pay-report';
import { Carpet } from 'src/modules/carpet/carpet.entity';
import { Clients } from 'src/modules/clients/clients.entity';
import { Between, MoreThan, Repository } from 'typeorm';

import { CarpetReception } from '../carpet-receptions/carpet-reception.entity';

@Injectable()
export class AnalysisService {
  constructor(
    @InjectRepository(Clients)
    private readonly clientsService: Repository<Clients>,
    @InjectRepository(CarpetReception)
    private readonly carpetReceptionService: Repository<CarpetReception>,
    @InjectRepository(Carpet) private readonly carpetService: Repository<Carpet>,
  ) {}

  private async getReport(userId: number, date: string) {
    const filterDate = new Date(date);
    const allReceptions = await this.carpetReceptionService.find({
      where: {
        dateAt: MoreThan(filterDate),
        userId: userId,
      },
    });

    const carpetInfo = allReceptions.reduce(
      (total, item) => {
        const carpet = item.numberOfCarpet ?? 0;
        const tracks = item.numberOfTracks ?? 0;

        total.numberOfClients += 1;
        total.numberOfCarpet += carpet;
        total.numberOfTracks += tracks;
        return total;
      },
      { numberOfClients: 0, numberOfCarpet: 0, numberOfTracks: 0 },
    );

    const allCarpet = await this.carpetService.find({
      where: {
        timeAt: MoreThan(filterDate),
        userId: userId,
      },
    });

    const surfaceAndForPayment = allCarpet.reduce(
      (total, item) => {
        total.surface += Number(item.carpetSurface ?? 0);
        total.forPay += Number(item.forPayment ?? 0);
        return total;
      },
      { surface: 0, forPay: 0 },
    );

    return new AnalysisInfo(
      carpetInfo.numberOfClients,
      carpetInfo.numberOfCarpet,
      carpetInfo.numberOfTracks,
      surfaceAndForPayment.surface,
      surfaceAndForPayment.forPay,
    );
  }

  async getDailyReport(userId: number): Promise<AnalysisInfo> {
    const date = new Date().toISOString().substring(0, 10) + ' 00:00:00';
    return await this.getReport(userId, date);
  }

  async theWeeklyReport(userId: number): Promise<AnalysisInfo> {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    const date = d.toISOString().substring(0, 19).replace('T', ' ');

    return await this.getReport(userId, date);
  }

  async theMontlyReport(userId: number): Promise<AnalysisInfo> {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    const date = d.toISOString().substring(0, 19).replace('T', ' ');

    return await this.getReport(userId, date);
  }

  async theYearReport(userId: number): Promise<AnalysisInfo> {
    const d = new Date();
    d.setDate(d.getDate() - 365);
    const date = d.toISOString().substring(0, 19).replace('T', ' ');

    return await this.getReport(userId, date);
  }

  async lastSevenDayReport(userId: number) {
    const d = new Date();
    d.setDate(d.getDate() - 8);

    const filterDate = new Date(d);

    const allClient = await this.clientsService.find({
      where: {
        timeAt: MoreThan(filterDate),
        userId: userId,
      },
      order: {
        timeAt: 'DESC',
      },
    });

    const clientsLastSevenDay = ClientsReport(allClient);

    const allReceptions = await this.carpetReceptionService.find({
      where: {
        dateAt: MoreThan(filterDate),
        userId: userId,
      },
      order: {
        timeAt: 'DESC',
      },
    });

    const carpetLastSevenDay = NumberOfCarpetReport(
      allReceptions.map((reception) => ({
        ...reception,
        numberOfCarpet: reception.numberOfCarpet ?? 0,
        numberOfTracks: reception.numberOfTracks ?? 0,
      })),
    );

    const allCarpet = await this.carpetService.find({
      where: {
        timeAt: MoreThan(filterDate),
        userId: userId,
      },
      order: {
        timeAt: 'DESC',
      },
    });

    const surfacePayLastSevenDay = SurfacePayReport(allCarpet);

    return new AnalysisReportInfo(clientsLastSevenDay, carpetLastSevenDay, surfacePayLastSevenDay);
  }

  async montryReport(userId: number, data?: string) {
    const d = new Date();
    d.setDate(d.getDate() - 30);

    const endDateString = data ? data : new Date().toISOString().substring(0, 10);

    const startDate = new Date(d.toISOString().substring(0, 10) + 'T00:00:00');
    const endDate = new Date(endDateString + 'T23:59:59');

    const allClient = await this.clientsService.find({
      where: {
        timeAt: Between(startDate, endDate),
        userId: userId,
      },
    });

    const clientsLastMonth = ClientsReport(allClient);

    const allReceptions = await this.carpetReceptionService.find({
      where: {
        timeAt: Between(startDate, endDate),
        userId: userId,
      },
    });

    const carpetLastMonth = NumberOfCarpetReport(
      allReceptions.map((reception) => ({
        ...reception,
        numberOfCarpet: reception.numberOfCarpet ?? 0,
        numberOfTracks: reception.numberOfTracks ?? 0,
      })),
    );

    const allCarpet = await this.carpetService.find({
      where: {
        timeAt: Between(startDate, endDate),
        userId: userId,
      },
    });

    const surfaceAndPayLastMonth = SurfacePayReport(allCarpet);

    return new AnalysisReportInfo(clientsLastMonth, carpetLastMonth, surfaceAndPayLastMonth);
  }

  async yearReport(userId: number) {
    const d = new Date();
    const m = d.getMonth();
    const y = d.getFullYear();

    const months: [string, AnalysisReportInfo][] = [];

    for (let i = 0; i < 12; i++) {
      const month = new Date(y, m - i, 1).toISOString().split('T')[0];
      const ad = await this.montryReport(userId, month);
      months.push([month, ad]);
    }

    return months;
  }
}
