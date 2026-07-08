import { Injectable } from '@nestjs/common';
import { AnalysisInfo } from 'src/modules/analysis/utils/analysis-info';
import { AnalysisReportInfo } from 'src/modules/analysis/utils/analysis-report.info';
import { ClientsReport } from 'src/modules/analysis/utils/clients-report';
import { NumberOfCarpetReport } from 'src/modules/analysis/utils/number-of-carpet-report';
import { SurfacePayReport } from 'src/modules/analysis/utils/surface-pay-report';
import { ClientsService } from 'src/modules/clients/clients.service';

import { CarpetService } from '../carpet/carpet.service';
import { CarpetReceptionsService } from '../carpet-receptions/carpet-reception.service';

@Injectable()
export class AnalysisService {
  constructor(
    private readonly clientsService: ClientsService,
    private readonly carpetReceptionsService: CarpetReceptionsService,
    private readonly carpetService: CarpetService,
  ) {}

  private async getAggregateReport(
    userId: number,
    startDate: Date,
    endDate: Date = new Date(),
  ): Promise<AnalysisInfo> {
    const [receptionStats, carpetStats] = await Promise.all([
      this.carpetReceptionsService.getReceptionAnalysisStats(userId, startDate, endDate),
      this.carpetService.getCarpetAnalysisStats(userId, startDate, endDate),
    ]);

    return {
      numberOfClients: receptionStats.numberOfClients,
      numberOfCarpet: receptionStats.numberOfCarpet,
      numberOfTracks: receptionStats.numberOfTracks,
      totalSurface: carpetStats.surface,
      totalPrice: carpetStats.forPay,
    };
  }

  async getDailyReport(userId: number): Promise<AnalysisInfo> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    return this.getAggregateReport(userId, startOfDay);
  }

  async getWeeklyReport(userId: number): Promise<AnalysisInfo> {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    return this.getAggregateReport(userId, startOfWeek);
  }

  async getMonthlyReport(userId: number): Promise<AnalysisInfo> {
    const startOfMonth = new Date();
    startOfMonth.setDate(startOfMonth.getDate() - 30);
    return this.getAggregateReport(userId, startOfMonth);
  }

  async getYearReport(userId: number): Promise<AnalysisInfo> {
    const startOfYear = new Date();
    startOfYear.setDate(startOfYear.getDate() - 365);
    return this.getAggregateReport(userId, startOfYear);
  }

  async lastSevenDayReport(userId: number): Promise<AnalysisReportInfo> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date();

    const [allClients, allReceptions, allCarpets] = await Promise.all([
      this.clientsService.getAllClients(userId),
      this.carpetReceptionsService.getReceptionsForAnalysis(userId, startDate, endDate),
      this.carpetService.getCarpetsForAnalysis(userId, startDate, endDate),
    ]);

    return {
      clients: ClientsReport(allClients),
      numberOfCarpet: NumberOfCarpetReport(
        allReceptions.map((r) => ({
          ...r,
          numberOfCarpet: r.numberOfCarpet ?? 0,
          numberOfTracks: r.numberOfTracks ?? 0,
        })),
      ),
      surfaceAndForPayment: SurfacePayReport(allCarpets),
    };
  }

  async monthlyReport(userId: number, customEndDate?: string): Promise<AnalysisReportInfo> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    startDate.setHours(0, 0, 0, 0);

    const endDate = customEndDate ? new Date(customEndDate + 'T23:59:59') : new Date();

    const [allClients, allReceptions, allCarpets] = await Promise.all([
      this.clientsService.getAllClients(userId),
      this.carpetReceptionsService.getReceptionsForAnalysis(userId, startDate, endDate),
      this.carpetService.getCarpetsForAnalysis(userId, startDate, endDate),
    ]);

    return {
      clients: ClientsReport(allClients),
      numberOfCarpet: NumberOfCarpetReport(
        allReceptions.map((r) => ({
          ...r,
          numberOfCarpet: r.numberOfCarpet ?? 0,
          numberOfTracks: r.numberOfTracks ?? 0,
        })),
      ),
      surfaceAndForPayment: SurfacePayReport(allCarpets),
    };
  }

  async yearReport(userId: number): Promise<[string, AnalysisReportInfo][]> {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const months: [string, AnalysisReportInfo][] = [];

    for (let i = 0; i < 12; i++) {
      const targetDate = new Date(currentYear, currentMonth - i, 1);
      const monthStr = targetDate.toISOString().split('T')[0];

      const reportData = await this.monthlyReport(userId, monthStr);
      months.push([monthStr, reportData]);
    }

    return months;
  }
}
