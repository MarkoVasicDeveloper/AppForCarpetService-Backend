import { Test, TestingModule } from '@nestjs/testing';

import { CarpetService } from '../carpet/carpet.service';
import { CarpetReceptionsService } from '../carpet-receptions/carpet-reception.service';
import { ClientsService } from '../clients/clients.service';

import { AnalysisService } from './analysis.service';
import { AnalysisReportInfo } from './utils/analysis-report.info';

type MockService<T> = {
  [P in keyof T]?: jest.Mock;
};

describe('AnalysisService', () => {
  let service: AnalysisService;
  let clientsService: MockService<ClientsService>;
  let carpetReceptionsService: MockService<CarpetReceptionsService>;
  let carpetService: MockService<CarpetService>;

  beforeEach(async () => {
    const mockClientsServiceFactory = (): MockService<ClientsService> => ({
      getAllClients: jest.fn(),
    });

    const mockCarpetReceptionsServiceFactory = (): MockService<CarpetReceptionsService> => ({
      getReceptionAnalysisStats: jest.fn(),
      getReceptionsForAnalysis: jest.fn(),
    });

    const mockCarpetServiceFactory = (): MockService<CarpetService> => ({
      getCarpetAnalysisStats: jest.fn(),
      getCarpetsForAnalysis: jest.fn(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalysisService,
        { provide: ClientsService, useFactory: mockClientsServiceFactory },
        { provide: CarpetReceptionsService, useFactory: mockCarpetReceptionsServiceFactory },
        { provide: CarpetService, useFactory: mockCarpetServiceFactory },
      ],
    }).compile();

    service = module.get<AnalysisService>(AnalysisService);
    clientsService = module.get<MockService<ClientsService>>(ClientsService);
    carpetReceptionsService =
      module.get<MockService<CarpetReceptionsService>>(CarpetReceptionsService);
    carpetService = module.get<MockService<CarpetService>>(CarpetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Aggregate Reports (Daily, Weekly, Monthly, Yearly)', () => {
    const userId = 1;

    it('should correctly combine and map stats from carpet and reception services', async () => {
      carpetReceptionsService.getReceptionAnalysisStats!.mockResolvedValue({
        numberOfClients: 5,
        numberOfCarpet: 15,
        numberOfTracks: 2,
      });

      carpetService.getCarpetAnalysisStats!.mockResolvedValue({
        surface: 45.5,
        forPay: 9000,
      });

      const result = await service.getDailyReport(userId);

      expect(carpetReceptionsService.getReceptionAnalysisStats).toHaveBeenCalledWith(
        userId,
        expect.any(Date),
        expect.any(Date),
      );
      expect(carpetService.getCarpetAnalysisStats).toHaveBeenCalledWith(
        userId,
        expect.any(Date),
        expect.any(Date),
      );

      expect(result).toEqual({
        numberOfClients: 5,
        numberOfCarpet: 15,
        numberOfTracks: 2,
        totalSurface: 45.5,
        totalPrice: 9000,
      });
    });
  });

  describe('lastSevenDayReport and monthlyReport', () => {
    const userId = 1;

    beforeEach(() => {
      clientsService.getAllClients!.mockResolvedValue([]);

      carpetReceptionsService.getReceptionsForAnalysis!.mockResolvedValue([
        { id: 1, numberOfCarpet: 3, numberOfTracks: null, timeAt: new Date() },
      ]);

      carpetService.getCarpetsForAnalysis!.mockResolvedValue([]);
    });

    it('should successfully build lastSevenDayReport structure', async () => {
      const result = await service.lastSevenDayReport(userId);

      expect(clientsService.getAllClients).toHaveBeenCalledWith(userId);
      expect(carpetReceptionsService.getReceptionsForAnalysis).toHaveBeenCalledWith(
        userId,
        expect.any(Date),
        expect.any(Date),
      );
      expect(carpetService.getCarpetsForAnalysis).toHaveBeenCalledWith(
        userId,
        expect.any(Date),
        expect.any(Date),
      );

      expect(result).toHaveProperty('clients');
      expect(result).toHaveProperty('numberOfCarpet');
      expect(result).toHaveProperty('surfaceAndForPayment');
    });

    it('should handle customEndDate in monthlyReport smoothly', async () => {
      const customEndDate = '2026-07-10';

      const result = await service.monthlyReport(userId, customEndDate);

      expect(carpetReceptionsService.getReceptionsForAnalysis).toHaveBeenCalledWith(
        userId,
        expect.any(Date),
        new Date('2026-07-10T23:59:59'),
      );
      expect(result).toBeDefined();
    });
  });

  describe('yearReport', () => {
    it('should call monthlyReport exactly 12 times and build a trend array', async () => {
      const userId = 1;
      const mockReportInfo = { clients: {}, numberOfCarpet: {}, surfaceAndForPayment: {} };

      const monthlyReportSpy = jest
        .spyOn(service, 'monthlyReport')
        .mockResolvedValue(mockReportInfo as unknown as AnalysisReportInfo);

      const result = await service.yearReport(userId);

      expect(monthlyReportSpy).toHaveBeenCalledTimes(12);
      expect(result.length).toBe(12);
      expect(result[0][1]).toEqual(mockReportInfo);
    });
  });
});
