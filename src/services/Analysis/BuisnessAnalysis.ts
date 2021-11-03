/* eslint-disable prettier/prettier */
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Carpet } from "entities/Carpet";
import { CarpetReception } from "entities/CarpetReception";
import { Clients } from "entities/Clients";
import { AnalysisInfo } from "src/misc/analysis.info";
import { MoreThan, Repository } from "typeorm";

@Injectable()

export class BuisnessAnalysis {
    constructor(@InjectRepository(Clients) private readonly clientsService: Repository<Clients>,
                @InjectRepository(CarpetReception) private readonly carpetReceptionService: Repository<CarpetReception>,
                @InjectRepository(Carpet) private readonly carpetService: Repository<Carpet>
    ) { }

    async getDailyReport():Promise<AnalysisInfo> {
        const date = new Date().toISOString().split('T')[0]
        
        const allClient = await this.clientsService.find({
            where: {
                timeAt: date
            }
        })

        const numberOfClients = allClient.length

        const allReceptions = await this.carpetReceptionService.find({
            where: {
                dateAt: new Date().toISOString().split('T')[0]
            }
        })
        
        let numberOfCarpet = 0;
        let numberOfTracks = 0;
        for (const carpet of allReceptions) {
            numberOfCarpet += Number(carpet.numberOfCarpet)
            numberOfTracks += Number(carpet.numberOfTracks)
        }

        const allCarpet = await this.carpetService.find({
            where: {
                timeAt: new Date().toISOString().split('T')[0]
            }
        })

        let surface = 0;
        let forPay = 0;

        for(const carpetPart of allCarpet) {
            surface += carpetPart.carpetSurface;
            forPay += carpetPart.forPayment
        }
        
        return new AnalysisInfo(
            numberOfClients,
            numberOfTracks,
            numberOfCarpet,
            surface,
            forPay
        )
    }

    async theWeeklyReport():Promise<AnalysisInfo> {
        const d = new Date();
        d.setDate(d.getDate()-7);
        
        const allClient = await this.clientsService.find({
            where: {
                timeAt: MoreThan(d.toISOString().split('T')[0])
            }
        })

        const numberOfClients = allClient.length

        const allReceptions = await this.carpetReceptionService.find({
            where: {
                dateAt: MoreThan(d.toISOString().split('T')[0])
            }
        })

        let numberOfCarpet = 0;
        let numberOfTracks = 0;
        for (const carpet of allReceptions) {
            numberOfCarpet += Number(carpet.numberOfCarpet)
            numberOfTracks += Number(carpet.numberOfTracks)
        }

        const allCarpet = await this.carpetService.find({
            where: {
                timeAt: MoreThan(d.toISOString().split('T')[0])
            }
        })

        let surface = 0;
        let forPay = 0;

        for(const carpetPart of allCarpet) {
            surface += carpetPart.carpetSurface;
            forPay += carpetPart.forPayment
        }
        
        return new AnalysisInfo(
            numberOfClients,
            numberOfCarpet,
            numberOfTracks,
            surface,
            forPay
        )
    }

    async theMontlyReport():Promise<AnalysisInfo> {
        const d = new Date();
        d.setDate(d.getDate()-30);
        
        const allClient = await this.clientsService.find({
            where: {
                timeAt: MoreThan(d.toISOString().split('T')[0])
            }
        })

        const numberOfClients = allClient.length

        const allReceptions = await this.carpetReceptionService.find({
            where: {
                dateAt: MoreThan(d.toISOString().split('T')[0])
            }
        })

        let numberOfCarpet = 0;
        let numberOfTracks = 0;
        for (const carpet of allReceptions) {
            numberOfCarpet += Number(carpet.numberOfCarpet)
            numberOfTracks += Number(carpet.numberOfTracks)
        }

        const allCarpet = await this.carpetService.find({
            where: {
                timeAt: MoreThan(d.toISOString().split('T')[0])
            }
        })

        let surface = 0;
        let forPay = 0;

        for(const carpetPart of allCarpet) {
            surface += carpetPart.carpetSurface;
            forPay += carpetPart.forPayment
        }
        
        return new AnalysisInfo(
            numberOfClients,
            numberOfCarpet,
            numberOfTracks,
            surface,
            forPay
        )
    }

    async theYearReport():Promise<AnalysisInfo> {
        const d = new Date();
        d.setDate(d.getDate()-7);
        
        const allClient = await this.clientsService.find({
            where: {
                timeAt: MoreThan(d.toISOString().split('T')[0])
            }
        })

        const numberOfClients = allClient.length

        const allReceptions = await this.carpetReceptionService.find({
            where: {
                dateAt: MoreThan(d.toISOString().split('T')[0])
            }
        })

        let numberOfCarpet = 0;
        let numberOfTracks = 0;
        for (const carpet of allReceptions) {
            numberOfCarpet += Number(carpet.numberOfCarpet)
            numberOfTracks += Number(carpet.numberOfTracks)
        }

        const allCarpet = await this.carpetService.find({
            where: {
                timeAt: MoreThan(d.toISOString().split('T')[0])
            }
        })

        let surface = 0;
        let forPay = 0;

        for(const carpetPart of allCarpet) {
            surface += carpetPart.carpetSurface;
            forPay += carpetPart.forPayment
        }
        
        return new AnalysisInfo(
            numberOfClients,
            numberOfCarpet,
            numberOfTracks,
            surface,
            forPay
        )
    }
}