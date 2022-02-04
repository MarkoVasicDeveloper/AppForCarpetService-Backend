/* eslint-disable prettier/prettier */
export function SurfacePayReport(array: any) {
  const surfacePay = array.reduce((total: any, item) => {
    const date = item.timeAt.toISOString().split("T")[0];

    if (total[date]) {
      total[date].surface += item.carpetSurface;
      total[date].forPayment += item.forPayment;
    } else {
      total[date] = {
        surface: item.carpetSurface,
        forPayment: item.forPayment,
      };
    }
    return total;
  }, {});

  return surfacePay;
}
