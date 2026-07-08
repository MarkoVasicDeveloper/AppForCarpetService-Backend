export type DailyCountReport = { [date: string]: number };
export type DailySurfacePayReport = { [date: string]: { surface: number; forPayment: number } };
export interface IReportItem {
  timeAt: Date | string;
}
export const formatDateKey = (timeAt: Date | string): string => {
  const dateObject = timeAt instanceof Date ? timeAt : new Date(timeAt);
  return dateObject.toISOString().split('T')[0];
};
