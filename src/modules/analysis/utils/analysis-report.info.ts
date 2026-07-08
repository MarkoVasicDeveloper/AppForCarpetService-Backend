import { DailyCountReport, DailySurfacePayReport } from './report-types';

export interface AnalysisReportInfo {
  clients: DailyCountReport;
  numberOfCarpet: DailyCountReport;
  surfaceAndForPayment: DailySurfacePayReport;
}
