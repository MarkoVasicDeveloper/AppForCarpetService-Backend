import { DailySurfacePayReport, IReportItem, formatDateKey } from './report-types';

interface ISurfacePayItem extends IReportItem {
  carpetSurface: number | string | null;
  forPayment: number | string | null;
}

export function SurfacePayReport(array: ISurfacePayItem[]): DailySurfacePayReport {
  return array.reduce<DailySurfacePayReport>((total, item) => {
    const date = formatDateKey(item.timeAt);

    const currentSurface = Number(item.carpetSurface ?? 0);
    const currentPayment = Number(item.forPayment ?? 0);

    const existing = total[date] || { surface: 0, forPayment: 0 };

    total[date] = {
      surface: Number((existing.surface + currentSurface).toFixed(2)),
      forPayment: Number((existing.forPayment + currentPayment).toFixed(2)),
    };

    return total;
  }, {});
}
