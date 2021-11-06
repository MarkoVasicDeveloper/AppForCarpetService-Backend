/* eslint-disable prettier/prettier */
import { Controller, Get, SetMetadata, UseGuards } from "@nestjs/common";
import { AnalysisInfo } from "src/misc/analysis.info";
import { RolleCheckerGard } from "src/rollecheckergard/rolle.checker.gatd";
import { BuisnessAnalysis } from "src/services/Analysis/BuisnessAnalysis";

@Controller('api/analysis')

export class AnalysisController{
    constructor(private readonly analysisService: BuisnessAnalysis) {}

    @Get('day')
    @UseGuards(RolleCheckerGard)
    @SetMetadata('allow_to_roles', ['user'])
    async getDataForDay():Promise<AnalysisInfo> {
        return await this.analysisService.getDailyReport();
    }

    @Get('weekend')
    @UseGuards(RolleCheckerGard)
    @SetMetadata('allow_to_roles', ['user'])
    async getDataForWeekend():Promise<AnalysisInfo> {
        return await this.analysisService.theWeeklyReport();
    }

    @Get('monthly')
    @UseGuards(RolleCheckerGard)
    @SetMetadata('allow_to_roles', ['user'])
    async getDataForMonth():Promise<AnalysisInfo> {
        return await this.analysisService.theMontlyReport();
    }

    @Get('year')
    @UseGuards(RolleCheckerGard)
    @SetMetadata('allow_to_roles', ['user'])
    async getDataForYear():Promise<AnalysisInfo> {
        return await this.analysisService.theYearReport();
    }

    @Get('lastSevenDayReport')
    @UseGuards(RolleCheckerGard)
    @SetMetadata('allow_to_roles', ['user'])
    async lastSevenDayReport() {
        return await this.analysisService.lastSevenDayReport();
    }
}