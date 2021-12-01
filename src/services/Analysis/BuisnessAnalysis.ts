/* eslint-disable prettier/prettier */
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Carpet } from "entities/Carpet";
import { CarpetReception } from "entities/CarpetReception";
import { Clients } from "entities/Clients";
import { AnalysisInfo } from "src/misc/analysis.info";
import { LessThanOrEqual, MoreThan, MoreThanOrEqual, Repository } from "typeorm";

@Injectable()

export class BuisnessAnalysis {
    constructor(@InjectRepository(Clients) private readonly clientsService: Repository<Clients>,
                @InjectRepository(CarpetReception) private readonly carpetReceptionService: Repository<CarpetReception>,
                @InjectRepository(Carpet) private readonly carpetService: Repository<Carpet>
    ) { }

    async getDailyReport(userId: number):Promise<AnalysisInfo> {
        const date = new Date().toISOString().substr(0, 10) + ' 00:00:00'
        
        const allClient = await this.clientsService.find({
            where: {
                timeAt: MoreThan(date),
                userId: userId
            }
        })
        
        const numberOfClients = allClient.length

        const allReceptions = await this.carpetReceptionService.find({
            where: {
                dateAt: MoreThan(date),
                userId: userId
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
                timeAt: MoreThan(date),
                userId: userId
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

    async theWeeklyReport(userId: number):Promise<AnalysisInfo> {
        const d = new Date();
        d.setDate(d.getDate()-7);
        
        const allClient = await this.clientsService.find({
            where: {
                timeAt: MoreThan(d.toISOString().substr(0, 19).replace('T', ' ')),
                userId: userId
            }
        })

        const numberOfClients = allClient.length

        const allReceptions = await this.carpetReceptionService.find({
            where: {
                dateAt: MoreThan(d.toISOString().substr(0, 19).replace('T', ' ')),
                userId: userId
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
                timeAt: MoreThan(d.toISOString().substr(0, 19).replace('T', ' ')),
                userId: userId
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

    async theMontlyReport(userId: number):Promise<AnalysisInfo> {
        const d = new Date();
        d.setDate(d.getDate()-30);
        
        const allClient = await this.clientsService.find({
            where: {
                timeAt: MoreThan(d.toISOString().substring(0 , 10) + ' 00:00:00'),
                userId: userId
            }
        })

        const numberOfClients = allClient.length

        const allReceptions = await this.carpetReceptionService.find({
            where: {
                dateAt: MoreThan(d.toISOString().substring(0 , 10) + ' 00:00:00'),
                userId: userId
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
                timeAt: MoreThan(d.toISOString().substring(0 , 10) + ' 00:00:00'),
                userId: userId
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

    async theYearReport(userID: number):Promise<AnalysisInfo> {
        const d = new Date();
        d.setDate(d.getDate()-365);
        
        const allClient = await this.clientsService.find({
            where: {
                timeAt: MoreThan(d.toISOString()),
                userId: userID
            }
        })

        const numberOfClients = allClient.length

        const allReceptions = await this.carpetReceptionService.find({
            where: {
                dateAt: MoreThan(d.toISOString()),
                userId: userID
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
                timeAt: MoreThan(d.toISOString()),
                userId: userID
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

    async lastSevenDayReport (userId: number) {
        const d = new Date();
        d.setDate(d.getDate()-8);

        const allClient = await this.clientsService.find({
            where: {
                timeAt: MoreThan(d.toISOString()),
                userId: userId
            },
            order: {
                timeAt: 'DESC'
            }
        })

        const dataLastDate = []
        d.setDate(d.getDate()+7)

        const timeAt = allClient.map(client => {
            return (client.timeAt.toISOString().split('T')[0])
        })

        for(const time of timeAt) {
            if(time === d.toISOString().split('T')[0]) {
                dataLastDate.push(time)
            }
        }

        const dataLastTwoDay = [];
        d.setDate(d.getDate()-1)
        
        for(const time of timeAt) {
            if(time === d.toISOString().split('T')[0]) {
                dataLastTwoDay.push(time)
            }
        }

        const dataLastTreeDay = [];
        d.setDate(d.getDate()-1)
        
        for(const time of timeAt) {
            if(time === d.toISOString().split('T')[0]) {
                dataLastTreeDay.push(time)
            }
        }

        const dataLastFourDay = [];
        d.setDate(d.getDate()-1)
        
        for(const time of timeAt) {
            if(time === d.toISOString().split('T')[0]) {
                dataLastFourDay.push(time)
            }
        }

        const dataLastFifthDay = [];
        d.setDate(d.getDate()-1)
        
        for(const time of timeAt) {
            if(time === d.toISOString().split('T')[0]) {
                dataLastFifthDay.push(time)
            }
        }

        const dataLastSixtDay = [];
        d.setDate(d.getDate()-1)
        
        for(const time of timeAt) {
            if(time === d.toISOString().split('T')[0]) {
                dataLastSixtDay.push(time)
            }
        }

        const dataLastSevenDay = [];
        d.setDate(d.getDate()-1)
        
        for(const time of timeAt) {
            if(time === d.toISOString().split('T')[0]) {
                dataLastSevenDay.push(time)
            }
        }

        const t = new Date();
        t.setDate(t.getDate()-8);

        const allReceptions = await this.carpetReceptionService.find({
            where: {
                dateAt: MoreThan(t.toISOString().split('T')[0]),
                userId: userId
            },
            order: {
                timeAt: 'DESC'
            }
        })

        const receptionLastDay = [];
        t.setDate(t.getDate()+7);
        for(const one of allReceptions) {
            if(one.dateAt.toISOString().split('T')[0] === t.toISOString().split('T')[0]){
                receptionLastDay.push(one.numberOfCarpet + one.numberOfTracks)
            }
        }

        const receptionTwoDay = [];
        t.setDate(t.getDate()-1);
        for(const one of allReceptions) {
            if(one.dateAt.toISOString().split('T')[0] === t.toISOString().split('T')[0]){
                receptionTwoDay.push(one.numberOfCarpet + one.numberOfTracks)
            }
        }

        const receptionTreeDay = [];
        t.setDate(t.getDate()-1);
        for(const one of allReceptions) {
            if(one.dateAt.toISOString().split('T')[0] === t.toISOString().split('T')[0]){
                receptionTreeDay.push(one.numberOfCarpet + one.numberOfTracks)
            }
        }

        const receptionFourDay = [];
        t.setDate(t.getDate()-1);
        for(const one of allReceptions) {
            if(one.dateAt.toISOString().split('T')[0] === t.toISOString().split('T')[0]){
                receptionFourDay.push(one.numberOfCarpet + one.numberOfTracks)
            }
        }

        const receptionFifthDay = [];
        t.setDate(t.getDate()-1);
        for(const one of allReceptions) {
            if(one.dateAt.toISOString().split('T')[0] === t.toISOString().split('T')[0]){
                receptionFifthDay.push(one.numberOfCarpet + one.numberOfTracks)
            }
        }

        const receptionSixDay = [];
        t.setDate(t.getDate()-1);
        for(const one of allReceptions) {
            if(one.dateAt === t){
                receptionSixDay.push(one.numberOfCarpet + one.numberOfTracks)
            }
        }

        const receptionSevenDay = [];
        t.setDate(t.getDate()-1);
        for(const one of allReceptions) {
            if(one.dateAt.toISOString().split('T')[0] === t.toISOString().split('T')[0]){
                receptionSevenDay.push(one.numberOfCarpet + one.numberOfTracks)
            }
        }
        
        const dt = new Date();
        dt.setDate(dt.getDate()-8);

        const allCarpet = await this.carpetService.find({
            where: {
                timeAt: MoreThan(dt.toISOString()),
                userId: userId
            },
            order: {
                timeAt: 'DESC'
            }
        })

        const carpetLastDayPay = [];
        const carpetLastDaySurface = [];
        dt.setDate(dt.getDate()+7);

        for(const one of allCarpet) {
            if(one.timeAt.toISOString().split('T')[0] === dt.toISOString().split('T')[0]){
                carpetLastDayPay.push(one.forPayment)
                carpetLastDaySurface.push(one.carpetSurface)
            }
        }

        const carpetTwoDayPay = [];
        const carpetTwoDaySurface = [];
        dt.setDate(dt.getDate()-1);
        
        for(const one of allCarpet) {
            if(one.timeAt.toISOString().split('T')[0] === dt.toISOString().split('T')[0]){
                carpetTwoDayPay.push(one.forPayment)
                carpetTwoDaySurface.push(one.carpetSurface)
            }
        }

        const carpetTreeDayPay = [];
        const carpetTreeDaySurface = [];
        dt.setDate(dt.getDate()-1);
        
        for(const one of allCarpet) {
            if(one.timeAt.toISOString().split('T')[0] === dt.toISOString().split('T')[0]){
                carpetTreeDayPay.push(one.forPayment)
                carpetTreeDaySurface.push(one.carpetSurface)
            }
        }

        const carpetFourDayPay = [];
        const carpetFourDaySurface = [];
        dt.setDate(dt.getDate()-1);
        
        for(const one of allCarpet) {
            if(one.timeAt.toISOString().split('T')[0] === dt.toISOString().split('T')[0]){
                carpetFourDayPay.push(one.forPayment)
                carpetFourDaySurface.push(one.carpetSurface)
            }
        }

        const carpetFifthDayPay = [];
        const carpetFifthDaySurface = [];
        dt.setDate(dt.getDate()-1);
        
        for(const one of allCarpet) {
            if(one.timeAt.toISOString().split('T')[0] === dt.toISOString().split('T')[0]){
                carpetFifthDayPay.push(one.forPayment)
                carpetFifthDaySurface.push(one.carpetSurface)
            }
        }

        const carpetSixDayPay = [];
        const carpetSixDaySurface = [];
        dt.setDate(dt.getDate()-1);
        
        for(const one of allCarpet) {
            if(one.timeAt.toISOString().split('T')[0] === dt.toISOString().split('T')[0]){
                carpetSixDayPay.push(one.forPayment)
                carpetSixDaySurface.push(one.carpetSurface)
            }
        }

        const carpetSevenDayPay = [];
        const carpetSevenDaySurface = [];
        dt.setDate(dt.getDate()-1);
        
        for(const one of allCarpet) {
            if(one.timeAt.toISOString().split('T')[0] === dt.toISOString().split('T')[0]){
                carpetSevenDayPay.push(one.forPayment)
                carpetSevenDaySurface.push(one.carpetSurface)
            }
        }

        
        return [
            {
                'lastDayClients': dataLastDate.length, 
                'lastTwoDayClients': dataLastTwoDay.length,
                'lastTreeDayClients' : dataLastTreeDay.length,
                'lastFourDayClients': dataLastFourDay.length,
                'lastFifthDayClients': dataLastFifthDay.length,
                'lastSixtDayClients': dataLastSixtDay.length,
                'lastSevenDayClients': dataLastSevenDay.length
            },
            {
                'lastDayNumberOfCarpet' : receptionLastDay,
                'lastTwoDayNumberOfCarpet' : receptionTwoDay,
                'lastTreeDayNumberOfCarpet' : receptionTreeDay,
                'lastFourDayNumberOfCarpet' : receptionFourDay,
                'lastFiftDayNumberOfCarpet' : receptionFifthDay,
                'lastSixDayNumberOfCarpet' : receptionSixDay,
                'lastSevenDayNumberOfCarpet' : receptionSevenDay,
            },
            {
                'lastDaySurface' : carpetLastDaySurface,
                'lastTwoDaySurface' : carpetTwoDaySurface,
                'lastTreeDaySurface' : carpetTreeDaySurface,
                'lastFourDaySurface' : carpetFourDaySurface,
                'lastFifthDaySurface' : carpetFifthDaySurface,
                'lastSixDaySurface' : carpetSixDaySurface,
                'lastSevenDaySurface' : carpetSevenDaySurface,
            },
            {
                'lastDayPay' : carpetLastDayPay,
                'lastTwoDayPay' : carpetTwoDayPay,
                'lastTreeDayPay' : carpetTreeDayPay,
                'lastFourDayPay' : carpetFourDayPay,
                'lastFifthDayPay' : carpetFifthDayPay,
                'lastSixDayPay' : carpetSixDayPay,
                'lastSevenDayPay' : carpetSevenDayPay,
            }
        ]
    }

    async montryReport(data: string, userId: number) {
        const d = new Date(data);
        d.setDate(d.getDate() - 30);// Return 30 days back in ISOstring format
        const dt = new Date(data);
        dt.setDate(dt.getDate())
        
        const allClient = await this.clientsService.find({
            where: {
                timeAt: MoreThanOrEqual(d.toISOString().substring(0 , 10) + ' 00:00:00') && LessThanOrEqual(data + ' 23:59:00'),//d.toISOString().split('T')[0]
                userId: userId
            }
        })
        
        const modifyClients = []
        for (const client of allClient) {
            client.timeAt = client.timeAt.toISOString().split('T')[0] as any
            modifyClients.push(client)
        }

        function groupBy(objectArray: any[], property: string | number) {
            return objectArray.reduce(function (acc, obj) {
              const key = obj[property]
              if (!acc[key]) {
                acc[key] = []
              }
              acc[key].push(obj)
              return acc
            }, [])
          }

        const groupedPeople = groupBy(modifyClients, 'timeAt')
          
        const da = new Date(data);
        da.setDate(da.getDate() - 30);// Return 30 days back in ISOstring format
        

        const time = []

        function arrayOfDate(date: string | number | Date, numberOfDays: number) {
            for(let i=0; i<numberOfDays; i++) {
                const da = new Date(date);
                da.setDate(da.getDate() - i)
                time.push(da.toISOString().split('T')[0])
            }
        }
        arrayOfDate(data, 30)

        const finallyArrClients = [];
        for (const timeDate of time){
            if(groupedPeople[timeDate.toString()]) {
                finallyArrClients.push({
                    time: timeDate,
                    number: groupedPeople[timeDate].length
                })
            }
        }
        
        const allReceptions = await this.carpetReceptionService.find({
            where: {
                timeAt: MoreThanOrEqual(d.toISOString().substring(0 , 10) + ' 00:00:00') && LessThanOrEqual(data + ' 23:59:00'),//d.toISOString().split('T')[0]
                userId: userId
            }
        })

        
        const modifyReception = []
        for (const reception of allReceptions) {
            reception.dateAt = reception.dateAt.toISOString().split('T')[0] as any
            modifyReception.push(reception)
        }

        const groupedReception = groupBy(modifyReception, 'dateAt')

        const finallyArrReceptions = [];
        for (const timeDate of time){
            if(groupedReception[timeDate]) {
                let numberOfCarpet = 0;
                for(const reception of groupedReception[timeDate]){
                    numberOfCarpet += reception.numberOfCarpet + reception.numberOfTracks
                }
                finallyArrReceptions.push({
                    time: timeDate,
                    numberOfCarpet: numberOfCarpet
                })
            }
        }

        const allCarpet = await this.carpetService.find({
            where: {
                timeAt: MoreThanOrEqual(d.toISOString().substring(0 , 10) + ' 00:00:00') && LessThanOrEqual(data + ' 23:59:00'),//d.toISOString().split('T')[0]
                userId: userId
            }
        })
        const modifyCarpet = []
        for (const carpet of allCarpet) {
            carpet.timeAt = carpet.timeAt.toISOString().split('T')[0] as any
            modifyCarpet.push(carpet)
        }
        
        const grupedCarpet = groupBy(modifyCarpet, 'timeAt')

        const finallyArrCarpetSurface = [];
        const finallyArrCarpetPay = [];
        for (const timeDate of time){
            if(grupedCarpet[timeDate]) {
                let surface = 0;
                let pay = 0;
                for(const carpet of grupedCarpet[timeDate]){
                    surface += carpet.carpetSurface;
                    pay += carpet.forPayment;
                }
                finallyArrCarpetSurface.push({
                    time: timeDate,
                    surface: surface
                })
                finallyArrCarpetPay.push({
                    time: timeDate,
                    pay: pay
                })
            }
        }

        return [
            {
                'Clients' : finallyArrClients
            },
            {
                'Carpet' : finallyArrReceptions
            },
            {
                'Surface' : finallyArrCarpetSurface
            },
            {
                'ForPayment' : finallyArrCarpetPay
            }
        ]
    }

    async yearReport(userId: number) {
        // concatination all clients, carpet, surface and forPay and return for all monts
        const january = await this.montryReport('2021-1-31', userId)
        const february = await this.montryReport('2021-2-28', userId)
        const march = await this.montryReport('2021-3-31', userId)
        const april = await this.montryReport('2021-4-30', userId)
        const may = await this.montryReport('2021-5-31', userId)
        const jun = await this.montryReport('2021-6-30', userId)
        const july = await this.montryReport('2021-7-31', userId)
        const august = await this.montryReport('2021-8-30', userId)
        const september = await this.montryReport('2021-9-30', userId)
        const october = await this.montryReport('2021-10-31', userId)
        const november = await this.montryReport('2021-11-30', userId)
        const december = await this.montryReport('2021-12-31', userId)

        let januaryNumberOfClients = 0;
        let januaryNumberOfCarpet = 0;
        let januaryNumberOfSurface = 0;
        let januaryNumberOfPay = 0;
        
        for (const obj of january) {
            if (obj.Clients) {
                try {
                    for(const client of obj.Clients) {
                        januaryNumberOfClients += client.number
                    }
                } catch (error) {}
                
            }
            if (obj.Carpet) {
                try {
                    for(const carpet of obj.Carpet) {
                        januaryNumberOfCarpet += carpet.numberOfCarpet
                    }
                } catch (error) {}
                
            }
            if (obj.Surface) {
                try {
                    for(const surface of obj.Surface) {
                        januaryNumberOfSurface += surface.surface
                    }
                } catch (error) {}
                
            }
            if (obj.ForPayment) {
                try {
                    for(const pay of obj.ForPayment) {
                        januaryNumberOfPay += pay.pay
                    }
                } catch (error) {}
                
            }
        }

        let februaryNumberOfClients = 0;
        let februaryNumberOfCarpet = 0;
        let februaryNumberOfSurface = 0;
        let februaryNumberOfPay = 0;
        
        for (const obj of february) {
            if (obj.Clients) {
                try {
                    for(const client of obj.Clients) {
                        februaryNumberOfClients += client.number
                    }
                } catch (error) {}
                
            }
            if (obj.Carpet) {
                try {
                    for(const carpet of obj.Carpet) {
                        februaryNumberOfCarpet += carpet.numberOfCarpet
                    }
                } catch (error) {}
                
            }
            if (obj.Surface) {
                try {
                    for(const surface of obj.Surface) {
                        februaryNumberOfSurface += surface.surface
                    }
                } catch (error) {}
                
            }
            if (obj.ForPayment) {
                try {
                    for(const pay of obj.ForPayment) {
                        februaryNumberOfPay += pay.pay
                    }
                } catch (error) {}
                
            }
        }

        let marchNumberOfClients = 0;
        let marchNumberOfCarpet = 0;
        let marchNumberOfSurface = 0;
        let marchNumberOfPay = 0;
        
        for (const obj of march) {
            if (obj.Clients) {
                try {
                    for(const client of obj.Clients) {
                        marchNumberOfClients += client.number
                    } 
                } catch (error) {}
                
            }
            if (obj.Carpet) {
                try {
                    for(const carpet of obj.Carpet) {
                        marchNumberOfCarpet += carpet.numberOfCarpet
                    }
                } catch (error) {}
                
            }
            if (obj.Surface) {
                try {
                    for(const surface of obj.Surface) {
                        marchNumberOfSurface += surface.surface
                    }
                } catch (error) {}
               
            }
            if (obj.ForPayment) {
                try {
                    for(const pay of obj.ForPayment) {
                        marchNumberOfPay += pay.pay
                    }
                } catch (error) {}
                
            }
        }

        let aprilNumberOfClients = 0;
        let aprilNumberOfCarpet = 0;
        let aprilNumberOfSurface = 0;
        let aprilNumberOfPay = 0;
        
        for (const obj of april) {
            if (obj.Clients) {
                try {
                    for(const client of obj.Clients) {
                        aprilNumberOfClients += client.number
                    }
                } catch (error) {}
                
            }
            if (obj.Carpet) {
                try {
                    for(const carpet of obj.Carpet) {
                        aprilNumberOfCarpet += carpet.numberOfCarpet
                    }
                } catch (error) {}
                
            }
            if (obj.Surface) {
                try {
                    for(const surface of obj.Surface) {
                        aprilNumberOfSurface += surface.surface
                    }
                } catch (error) {}
                
            }
            if (obj.ForPayment) {
                try {
                    for(const pay of obj.ForPayment) {
                        aprilNumberOfPay += pay.pay
                    }
                } catch (error) {}
                
            }
        }

        let mayNumberOfClients = 0;
        let mayNumberOfCarpet = 0;
        let mayNumberOfSurface = 0;
        let mayNumberOfPay = 0;
        
        for (const obj of may) {
            if (obj.Clients) {
                try {
                    for(const client of obj.Clients) {
                        mayNumberOfClients += client.number
                    }
                } catch (error) {}
                
            }
            if (obj.Carpet) {
                try {
                    for(const carpet of obj.Carpet) {
                        mayNumberOfCarpet += carpet.numberOfCarpet
                    }
                } catch (error) {}
                
            }
            if (obj.Surface) {
                try {
                    for(const surface of obj.Surface) {
                        mayNumberOfSurface += surface.surface
                    }
                } catch (error) {}
                
            }
            if (obj.ForPayment) {
                try {
                    for(const pay of obj.ForPayment) {
                        mayNumberOfPay += pay.pay
                    }
                } catch (error) {}
                
            }
        }

        let junNumberOfClients = 0;
        let junNumberOfCarpet = 0;
        let junNumberOfSurface = 0;
        let junNumberOfPay = 0;
        
        for (const obj of jun) {
            if (obj.Clients) {
                try {
                    for(const client of obj.Clients) {
                        junNumberOfClients += client.number
                    }
                } catch (error) {}
                
            }
            if (obj.Carpet) {
                try {
                    for(const carpet of obj.Carpet) {
                        junNumberOfCarpet += carpet.numberOfCarpet
                    }
                } catch (error) {}
                
            }
            if (obj.Surface) {
                try {
                    for(const surface of obj.Surface) {
                        junNumberOfSurface += surface.surface
                    }
                } catch (error) {}
                
            }
            if (obj.ForPayment) {
                try {
                    for(const pay of obj.ForPayment) {
                        junNumberOfPay += pay.pay
                    }
                } catch (error) {}
                
            }
        }

        let julyNumberOfClients = 0;
        let julyNumberOfCarpet = 0;
        let julyNumberOfSurface = 0;
        let julyNumberOfPay = 0;
        
        for (const obj of july) {
            if (obj.Clients) {
                try {
                    for(const client of obj.Clients) {
                        julyNumberOfClients += client.number
                    }
                } catch (error) {}
                
            }
            if (obj.Carpet) {
                try {
                    for(const carpet of obj.Carpet) {
                        julyNumberOfCarpet += carpet.numberOfCarpet
                    }
                } catch (error) {}
                
            }
            if (obj.Surface) {
                try {
                    for(const surface of obj.Surface) {
                        julyNumberOfSurface += surface.surface
                    }
                } catch (error) {}
                
            }
            if (obj.ForPayment) {
                try {
                    for(const pay of obj.ForPayment) {
                        julyNumberOfPay += pay.pay
                    }
                } catch (error) {}
                
            }
        }

        let augustNumberOfClients = 0;
        let augustNumberOfCarpet = 0;
        let augustNumberOfSurface = 0;
        let augustNumberOfPay = 0;
        
        for (const obj of august) {
            if (obj.Clients) {
                try {
                    for(const client of obj.Clients) {
                        augustNumberOfClients += client.number
                    }
                } catch (error) {}
                
            }
            if (obj.Carpet) {
                try {
                    for(const carpet of obj.Carpet) {
                        augustNumberOfCarpet += carpet.numberOfCarpet
                    }
                } catch (error) {}
                
            }
            if (obj.Surface) {
                try {
                    for(const surface of obj.Surface) {
                        augustNumberOfSurface += surface.surface
                    }
                } catch (error) {}
                
            }
            if (obj.ForPayment) {
                try {
                    for(const pay of obj.ForPayment) {
                        augustNumberOfPay += pay.pay
                    }
                } catch (error) {}
                
            }
        }

        let septemberNumberOfClients = 0;
        let septemberNumberOfCarpet = 0;
        let septemberNumberOfSurface = 0;
        let septemberNumberOfPay = 0;
        
        for (const obj of september) {
            if (obj.Clients) {
                try {
                    for(const client of obj.Clients) {
                        septemberNumberOfClients += client.number
                    }
                } catch (error) {}
                
            }
            if (obj.Carpet) {
                try {
                    for(const carpet of obj.Carpet) {
                        septemberNumberOfCarpet += carpet.numberOfCarpet
                    }
                } catch (error) {}
                
            }
            if (obj.Surface) {
                try {
                    for(const surface of obj.Surface) {
                        septemberNumberOfSurface += surface.surface
                    }
                } catch (error) {}
                
            }
            if (obj.ForPayment) {
                try {
                    for(const pay of obj.ForPayment) {
                        septemberNumberOfPay += pay.pay
                    }
                } catch (error) { }
                
            }
        }

        let octoberNumberOfClients = 0;
        let octoberNumberOfCarpet = 0;
        let octoberNumberOfSurface = 0;
        let octoberNumberOfPay = 0;
        
        for (const obj of october) {
            if (obj.Clients) {
                try {
                    for(const client of obj.Clients) {
                        octoberNumberOfClients += client.number
                    }
                } catch (error) {}
                
            }
            if (obj.Carpet) {
                try {
                    for(const carpet of obj.Carpet) {
                        octoberNumberOfCarpet += carpet.numberOfCarpet
                    }
                } catch (error) {}
                
            }
            if (obj.Surface) {
                try {
                    for(const surface of obj.Surface) {
                        octoberNumberOfSurface += surface.surface
                    }
                } catch (error) {}
                
            }
            if (obj.ForPayment) {
                try {
                    for(const pay of obj.ForPayment) {
                        octoberNumberOfPay += pay.pay
                    }
                } catch (error) {}
                
            }
        }

        let novemberNumberOfClients = 0;
        let novemberNumberOfCarpet = 0;
        let novemberNumberOfSurface = 0;
        let novemberNumberOfPay = 0;
        
        for (const obj of november) {
            if (obj.Clients) {
                try {
                    for(const client of obj.Clients) {
                        novemberNumberOfClients += client.number
                    }
                } catch (error) {}
                
            }
            if (obj.Carpet) {
                try {
                    for(const carpet of obj.Carpet) {
                        novemberNumberOfCarpet += carpet.numberOfCarpet
                        
                    }
                } catch (error) {}
                
            }
            if (obj.Surface) {
                try {
                    for(const surface of obj.Surface) {
                        novemberNumberOfSurface += surface.surface
                    }
                } catch (error) {}
                
            }
            if (obj.ForPayment) {
                try {
                    for(const pay of obj.ForPayment) {
                        novemberNumberOfPay += pay.pay
                    }
                } catch (error) {}
                
            }
        }

        let decemberNumberOfClients = 0;
        let decemberNumberOfCarpet = 0;
        let decemberNumberOfSurface = 0;
        let decemberNumberOfPay = 0;
        
        for (const obj of december) {
            if (obj.Clients) {
                try{
                    for(const client of obj.Clients) {
                        decemberNumberOfClients += client.number
                    }
                }catch{}
                
            }
            if (obj.Carpet) {
                try {
                    for(const carpet of obj.Carpet) {
                        decemberNumberOfCarpet += carpet.numberOfCarpet
                    }
                } catch (error) {}
                
            }
            if (obj.Surface) {
                try {
                    for(const surface of obj.Surface) {
                        decemberNumberOfSurface += surface.surface
                    }
                } catch (error) {}
                
            }
            if (obj.ForPayment) {
                try {
                    for(const pay of obj.ForPayment) {
                        decemberNumberOfPay += pay.pay
                    }
                } catch (error) {}
                
            }
        }

        return { 
            january: { 
                'Clients' : januaryNumberOfClients, 
                'Carpet' : januaryNumberOfCarpet, 
                'Surface': januaryNumberOfSurface,
                'ForPayment' : januaryNumberOfPay
            },
            february: { 
                'Clients' : februaryNumberOfClients, 
                'Carpet' : februaryNumberOfCarpet, 
                'Surface': februaryNumberOfSurface,
                'ForPayment' : februaryNumberOfPay
            },
            march: { 
                'Clients' : marchNumberOfClients, 
                'Carpet' : marchNumberOfCarpet, 
                'Surface': marchNumberOfSurface,
                'ForPayment' : marchNumberOfPay
            },
            april: { 
                'Clients' : aprilNumberOfClients, 
                'Carpet' : aprilNumberOfCarpet, 
                'Surface': aprilNumberOfSurface,
                'ForPayment' : aprilNumberOfPay
            },
            may: { 
                'Clients' : mayNumberOfClients, 
                'Carpet' : mayNumberOfCarpet, 
                'Surface': mayNumberOfSurface,
                'ForPayment' : mayNumberOfPay
            },
            jun: { 
                'Clients' : junNumberOfClients, 
                'Carpet' : junNumberOfCarpet, 
                'Surface': junNumberOfSurface,
                'ForPayment' : junNumberOfPay
            },
            july: { 
                'Clients' : julyNumberOfClients, 
                'Carpet' : julyNumberOfCarpet, 
                'Surface': julyNumberOfSurface,
                'ForPayment' : julyNumberOfPay
            },
            august: { 
                'Clients' : augustNumberOfClients, 
                'Carpet' : augustNumberOfCarpet, 
                'Surface': augustNumberOfSurface,
                'ForPayment' : augustNumberOfPay
            },
            september: { 
                'Clients' : septemberNumberOfClients, 
                'Carpet' : septemberNumberOfCarpet, 
                'Surface': septemberNumberOfSurface,
                'ForPayment' : septemberNumberOfPay
            }, 
            october: { 
                'Clients' : octoberNumberOfClients, 
                'Carpet' : octoberNumberOfCarpet, 
                'Surface': octoberNumberOfSurface,
                'ForPayment' : octoberNumberOfPay
            }, 
            novembar: { 
                'Clients' : novemberNumberOfClients, 
                'Carpet' : novemberNumberOfCarpet, 
                'Surface': novemberNumberOfSurface,
                'ForPayment' : novemberNumberOfPay
            },
            december: { 
                'Clients' : decemberNumberOfClients, 
                'Carpet' : decemberNumberOfCarpet, 
                'Surface': decemberNumberOfSurface,
                'ForPayment' : decemberNumberOfPay
            },
        }
    }
}