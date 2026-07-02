interface ICarpetReportResult {
  [date: string]: number;
}

interface ICarpetReportItem {
  timeAt: Date | string;
  numberOfCarpet: number;
  numberOfTracks: number;
}

export function NumberOfCarpetReport(array: ICarpetReportItem[]): ICarpetReportResult {
  const carpet = array.reduce((total: ICarpetReportResult, item) => {
    const dateObject = item.timeAt instanceof Date ? item.timeAt : new Date(item.timeAt);

    const date = dateObject.toISOString().split('T')[0];

    const totalCarpetsForItem = (item.numberOfCarpet ?? 0) + (item.numberOfTracks ?? 0);

    if (total[date]) {
      total[date] += totalCarpetsForItem;
    } else {
      total[date] = totalCarpetsForItem;
    }

    return total;
  }, {});

  return carpet;
}
