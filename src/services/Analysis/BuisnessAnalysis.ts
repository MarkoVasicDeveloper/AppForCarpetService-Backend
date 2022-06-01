/* eslint-disable prettier/prettier */
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Carpet } from "entities/Carpet";
import { CarpetReception } from "entities/CarpetReception";
import { Clients } from "entities/Clients";
import { AnalysisInfo } from "src/misc/analysis.info";
import { AnalysisReportInfo } from "src/misc/analysis.report.info";
import { ClientsReport } from "src/misc/clients.report";
import { NumberOfCarpetReport } from "src/misc/number.of.carpet.report";
import { SurfacePayReport } from "src/misc/surface.pay.report";
import {
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Repository,
} from "typeorm";

@Injectable()
export class BuisnessAnalysis {
  constructor(
    @InjectRepository(Clients)
    private readonly clientsService: Repository<Clients>,
    @InjectRepository(CarpetReception)
    private readonly carpetReceptionService: Repository<CarpetReception>,
    @InjectRepository(Carpet) private readonly carpetService: Repository<Carpet>
  ) {}

  private async getReport(userId: number, date: string) {
    const allReceptions = await this.carpetReceptionService.find({
      where: {
        dateAt: MoreThan(date),
        userId: userId,
      },
    });

    const carpetInfo = allReceptions.reduce(
      (total: any, item) => {
        const carpet = item.numberOfCarpet;
        const tracks = item.numberOfTracks;
        total.numberOfClients += 1;
        if (carpet !== undefined) total.numberOfCarpet += carpet;
        if (tracks !== undefined) total.numberOfTracks += tracks;
        return total;
      },
      { numberOfClients: 0, numberOfCarpet: 0, numberOfTracks: 0 }
    );

    const allCarpet = await this.carpetService.find({
      where: {
        timeAt: MoreThan(date),
        userId: userId,
      },
    });

    const surfaceAndForPayment = allCarpet.reduce(
      (total: any, item) => {
        total.surface += item.carpetSurface;
        total.forPay += item.forPayment;
        return total;
      },
      { surface: 0, forPay: 0 }
    );

    return new AnalysisInfo(
      carpetInfo.numberOfClients,
      carpetInfo.numberOfCarpet,
      carpetInfo.numberOfTracks,
      surfaceAndForPayment.surface,
      surfaceAndForPayment.forPay
    );
  }

  async getDailyReport(userId: number): Promise<AnalysisInfo> {
    const date = new Date().toISOString().substr(0, 10) + " 00:00:00";
    return await this.getReport(userId, date);
  }

  async theWeeklyReport(userId: number): Promise<AnalysisInfo> {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    const date = d.toISOString().substr(0, 19).replace("T", " ");

    return await this.getReport(userId, date);
  }

  async theMontlyReport(userId: number): Promise<AnalysisInfo> {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    const date = d.toISOString().substr(0, 19).replace("T", " ");

    return await this.getReport(userId, date);
  }

  async theYearReport(userId: number): Promise<AnalysisInfo> {
    const d = new Date();
    d.setDate(d.getDate() - 365);
    const date = d.toISOString().substr(0, 19).replace("T", " ");

    return await this.getReport(userId, date);
  }

  async lastSevenDayReport(userId: number) {
    const d = new Date();
    d.setDate(d.getDate() - 8);

    const allClient = await this.clientsService.find({
      where: {
        timeAt: MoreThan(d.toISOString()),
        userId: userId,
      },
      order: {
        timeAt: "DESC",
      },
    });

    const clientsLastSevenDay = ClientsReport(allClient);

    const allReceptions = await this.carpetReceptionService.find({
      where: {
        dateAt: MoreThan(d.toISOString().split("T")[0]),
        userId: userId,
      },
      order: {
        timeAt: "DESC",
      },
    });

    // Return object of all carpets and tracks for last seven days , per day
    const carpetLastSevenDay = NumberOfCarpetReport(allReceptions);

    const allCarpet = await this.carpetService.find({
      where: {
        timeAt: MoreThan(d.toISOString()),
        userId: userId,
      },
      order: {
        timeAt: "DESC",
      },
    });

    // Return object with day key and value of object with total surface and forPay
    const surfacePayLastSevenDay = SurfacePayReport(allCarpet);

    return new AnalysisReportInfo(
      clientsLastSevenDay,
      carpetLastSevenDay,
      surfacePayLastSevenDay
    );
  }

  async montryReport(userId: number, data?: string) {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    if (!data) data = new Date().toISOString().substring(0, 10);

    const allClient = await this.clientsService.find({
      where: {
        timeAt:
          MoreThanOrEqual(d.toISOString().substring(0, 10) + " 00:00:00") &&
          LessThanOrEqual(data + " 23:59:00"),
        userId: userId,
      },
    });
    console.log(allClient);
    const clientsLastMonth = ClientsReport(allClient);

    const allReceptions = await this.carpetReceptionService.find({
      where: {
        timeAt:
          MoreThanOrEqual(d.toISOString().substring(0, 10) + " 00:00:00") &&
          LessThanOrEqual(data + " 23:59:00"),
        userId: userId,
      },
    });

    const carpetLastMonth = NumberOfCarpetReport(allReceptions);

    const allCarpet = await this.carpetService.find({
      where: {
        timeAt:
          MoreThanOrEqual(d.toISOString().substring(0, 10) + " 00:00:00") &&
          LessThanOrEqual(data + " 23:59:00"),
        userId: userId,
      },
    });

    const surfaceAndPayLastMonth = SurfacePayReport(allCarpet);

    return new AnalysisReportInfo(
      clientsLastMonth,
      carpetLastMonth,
      surfaceAndPayLastMonth
    );
  }

  async yearReport(userId: number) {
    console.log(userId);
    // concatination all clients, carpet, surface and forPay and return for all monts
    const d = new Date();
    const m = d.getMonth();
    const y = d.getFullYear();
    const months = [];
    for (let i = 0; i < 12; i++) {
      const month = new Date(y, m - i, +1).toISOString().split("T")[0];
      const ad = await this.montryReport(userId, month);
      months.push([month, ad]);
    }

    return months;
  }
}
