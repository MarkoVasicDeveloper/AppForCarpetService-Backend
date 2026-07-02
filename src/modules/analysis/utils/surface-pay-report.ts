interface ISurfacePayDailyData {
  surface: number;
  forPayment: number;
}

interface ISurfacePayReportResult {
  [date: string]: ISurfacePayDailyData;
}

interface ISurfacePayItem {
  timeAt: Date | string;
  carpetSurface: number;
  forPayment: number;
}

export function SurfacePayReport(array: ISurfacePayItem[]): ISurfacePayReportResult {
  const surfacePay = array.reduce((total: ISurfacePayReportResult, item) => {
    const dateObject = item.timeAt instanceof Date ? item.timeAt : new Date(item.timeAt);

    const date = dateObject.toISOString().split('T')[0];

    if (total[date]) {
      total[date].surface += item.carpetSurface ?? 0;
      total[date].forPayment += item.forPayment ?? 0;
    } else {
      total[date] = {
        surface: item.carpetSurface ?? 0,
        forPayment: item.forPayment ?? 0,
      };
    }
    return total;
  }, {});

  return surfacePay;
}
