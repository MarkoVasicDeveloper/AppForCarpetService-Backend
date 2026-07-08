import { DailyCountReport, IReportItem, formatDateKey } from './report-types';

interface ICarpetReportItem extends IReportItem {
  numberOfCarpet: number | null;
  numberOfTracks: number | null;
}

export function NumberOfCarpetReport(array: ICarpetReportItem[]): DailyCountReport {
  return array.reduce<DailyCountReport>((total, item) => {
    const date = formatDateKey(item.timeAt);
    const count = (item.numberOfCarpet ?? 0) + (item.numberOfTracks ?? 0);

    total[date] = (total[date] || 0) + count;
    return total;
  }, {});
}
