/* eslint-disable prettier/prettier */
export class AnalysisReportInfo {
  clients: Record<string, unknown>;
  numberOfCarpet: Record<string, unknown>;
  surfaceAndForPayment: Record<string, unknown>;

  constructor(
    clients: Record<string, unknown>,
    numberOfCarpet: Record<string, unknown>,
    surfaceAndForPayment: Record<string, unknown>
  ) {
    (this.clients = clients),
      (this.numberOfCarpet = numberOfCarpet),
      (this.surfaceAndForPayment = surfaceAndForPayment);
  }
}
