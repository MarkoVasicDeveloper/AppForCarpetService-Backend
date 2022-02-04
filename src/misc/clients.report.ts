/* eslint-disable prettier/prettier */
export function ClientsReport(array: any) {
  const clients = array.reduce((total: any, item) => {
    const date = item.timeAt.toISOString().split("T")[0];
    if (total[date]) {
      total[date] += 1;
    } else {
      total[date] = 1;
    }
    return total;
  }, {});

  return clients;
}
