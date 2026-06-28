/* eslint-disable prettier/prettier */
export class AddCostDto {
  costsId: number;
  suppliersId: number;
  product: string;
  quantity: number;
  price: number;
  paid: boolean;
  maturityData?: string;
}
