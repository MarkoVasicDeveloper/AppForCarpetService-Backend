import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalysisService } from 'src/modules/analysis/analysis.service';
import { AnalysisInfo } from 'src/modules/analysis/utils/analysis-info';
import { AnalysisReportInfo } from 'src/modules/analysis/utils/analysis-report.info';
import { CurrentOwnerId } from 'src/shared/decorators/current-owner-id.decorator';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { RoleCheckerGuard } from 'src/shared/guards/role-checker.guard';

@Controller('analysis')
@UseGuards(RoleCheckerGuard)
@Roles(Role.ADMINISTRATOR, Role.USER)
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Get('daily')
  async getDailyReport(@CurrentOwnerId() userId: number): Promise<AnalysisInfo> {
    return await this.analysisService.getDailyReport(userId);
  }

  @Get('weekly')
  async getWeeklyReport(@CurrentOwnerId() userId: number): Promise<AnalysisInfo> {
    return await this.analysisService.getWeeklyReport(userId);
  }

  @Get('monthly')
  async getMonthlyReport(@CurrentOwnerId() userId: number): Promise<AnalysisInfo> {
    return await this.analysisService.getMonthlyReport(userId);
  }

  @Get('yearly')
  async getYearReport(@CurrentOwnerId() userId: number): Promise<AnalysisInfo> {
    return await this.analysisService.getYearReport(userId);
  }

  @Get('reports/last-seven-days')
  async getLastSevenDayReport(@CurrentOwnerId() userId: number): Promise<AnalysisReportInfo> {
    return await this.analysisService.lastSevenDayReport(userId);
  }

  @Get('reports/monthly')
  async getDetailedMonthlyReport(
    @CurrentOwnerId() userId: number,
    @Query('date') customEndDate?: string,
  ): Promise<AnalysisReportInfo> {
    return await this.analysisService.monthlyReport(userId, customEndDate);
  }

  @Get('reports/yearly')
  async getDetailedYearlyReport(
    @CurrentOwnerId() userId: number,
  ): Promise<[string, AnalysisReportInfo][]> {
    return await this.analysisService.yearReport(userId);
  }
}
