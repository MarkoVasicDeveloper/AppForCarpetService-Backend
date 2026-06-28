/* eslint-disable prettier/prettier */
import { Controller, Get, Param, Post, SetMetadata, UseGuards } from '@nestjs/common';
import { AnalysisInfo } from 'src/misc/analysis.info';
import { AnalysisService } from 'src/modules/analysis/analysis.service';
import { RolleCheckerGard } from 'src/rollecheckergard/rolle.checker.gatd';

@Controller('api/analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Get('day/:id')
  @UseGuards(RolleCheckerGard)
  @SetMetadata('allow_to_roles', ['user', 'administrator'])
  async getDataForDay(@Param('id') userId: number): Promise<AnalysisInfo> {
    return await this.analysisService.getDailyReport(userId);
  }

  @Get('weekend/:id')
  @UseGuards(RolleCheckerGard)
  @SetMetadata('allow_to_roles', ['user', 'administrator'])
  async getDataForWeekend(@Param('id') userId: number): Promise<AnalysisInfo> {
    return await this.analysisService.theWeeklyReport(userId);
  }

  @Get('monthly/:id')
  @UseGuards(RolleCheckerGard)
  @SetMetadata('allow_to_roles', ['user', 'administrator'])
  async getDataForMonth(@Param('id') userId: number): Promise<AnalysisInfo> {
    return await this.analysisService.theMontlyReport(userId);
  }

  @Get('year/:id')
  @UseGuards(RolleCheckerGard)
  @SetMetadata('allow_to_roles', ['user', 'administrator'])
  async getDataForYear(@Param('id') userId: number): Promise<AnalysisInfo> {
    return await this.analysisService.theYearReport(userId);
  }

  @Get('lastSevenDayReport/:id')
  @UseGuards(RolleCheckerGard)
  @SetMetadata('allow_to_roles', ['user', 'administrator'])
  async lastSevenDayReport(@Param('id') userId: number) {
    return await this.analysisService.lastSevenDayReport(userId);
  }

  @Post('montlyReport/:userId')
  @UseGuards(RolleCheckerGard)
  @SetMetadata('allow_to_roles', ['user', 'administrator'])
  async mondlyReport(@Param('userId') userId: number) {
    return await this.analysisService.montryReport(userId);
  }

  @Get('yearReport/:id')
  @UseGuards(RolleCheckerGard)
  @SetMetadata('allow_to_roles', ['user', 'administrator'])
  async yearReport(@Param('id') userId: number) {
    return await this.analysisService.yearReport(userId);
  }
}
