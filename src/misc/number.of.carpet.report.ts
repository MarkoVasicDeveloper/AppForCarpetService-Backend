/* eslint-disable prettier/prettier */
export function NumberOfCarpetReport(array: any) {
  const carpet = array.reduce((total: any, item) => {
    const date = item.timeAt.toISOString().split("T")[0];
    if (total[date]) {
      total[date] += item.numberOfCarpet + item.numberOfTracks;
    } else {
      total[date] = item.numberOfCarpet + item.numberOfTracks;
    }

    return total;
  }, {});

  return carpet;
}
