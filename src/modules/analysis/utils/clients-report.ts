import { DailyCountReport, IReportItem, formatDateKey } from './report-types';

export function ClientsReport(array: IReportItem[]): DailyCountReport {
  return array.reduce<DailyCountReport>((total, item) => {
    const date = formatDateKey(item.timeAt);
    total[date] = (total[date] || 0) + 1;
    return total;
  }, {});
}
