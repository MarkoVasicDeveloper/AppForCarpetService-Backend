interface IClientsReportResult {
  [date: string]: number;
}

interface IReportItem {
  timeAt: Date | string;
}

export function ClientsReport(array: IReportItem[]): IClientsReportResult {
  const clients = array.reduce((total: IClientsReportResult, item) => {
    const dateObject = item.timeAt instanceof Date ? item.timeAt : new Date(item.timeAt);

    const date = dateObject.toISOString().split('T')[0];

    if (total[date]) {
      total[date] += 1;
    } else {
      total[date] = 1;
    }
    return total;
  }, {});

  return clients;
}
