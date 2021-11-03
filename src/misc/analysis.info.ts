/* eslint-disable prettier/prettier */
export class AnalysisInfo{
    numberOfClients: number
    numberOfCarpet: number
    numberOfTracks: number
    totalSurface: number
    totalPrice: number

    constructor(numberOfClients: number, numberOfCarpet: number, numberOfTracks: number, totalSurface: number, totalPrice: number) {
        this.numberOfClients = numberOfClients
        this.numberOfCarpet = numberOfCarpet
        this.numberOfTracks = numberOfTracks
        this.totalSurface = totalSurface
        this.totalPrice = totalPrice
    }
}