export class EditCostEntryDto {
  userId!: number;
  suppliersId?: number;
  product?: string;
  quantity?: number;
  price?: number;
  paid?: boolean;
  maturityData?: string;
}
