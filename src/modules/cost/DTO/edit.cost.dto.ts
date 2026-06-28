/* eslint-disable prettier/prettier */
export class EditCostDto {
  costsId: number;
  suppliersId?: number;
  product?: string;
  quantity?: number;
  price?: number;
  paid?: boolean;
  maturityData?: string;
  userId: number;
}
