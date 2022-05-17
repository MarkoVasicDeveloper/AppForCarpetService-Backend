import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("cost", { schema: "apiperionica" })
export class Cost {
  @PrimaryGeneratedColumn({ type: "int", name: "cost_id", unsigned: true })
  costId: number;

  @Column("int", { name: "costs_id", unsigned: true, default: () => "'0'" })
  costsId: number;

  @Column("int", { name: "suppliers_id", unsigned: true, default: () => "'0'" })
  suppliersId: number;

  @Column("varchar", { name: "product", length: 255, default: () => "'0'" })
  product: string;

  @Column("int", { name: "quantity", default: () => "'0'" })
  quantity: number;

  @Column("int", { name: "price", default: () => "'0'" })
  price: number;

  @Column("tinyint", { name: "paid", width: 1, default: () => "'0'" })
  paid: boolean;

  @Column("varchar", { name: "maturity_data", nullable: true, length: 50 })
  maturityData: string | null;

  @Column("int", { name: "user_id", unsigned: true })
  userId: number;
}
