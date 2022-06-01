import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("income", { schema: "apiperionica" })
export class Income {
  @PrimaryGeneratedColumn({ type: "int", name: "income_id", unsigned: true })
  incomeId: number;

  @Column("varchar", { name: "name", length: 255, default: () => "'0'" })
  name: string;

  @Column("varchar", { name: "price", length: 50, default: () => "'0'" })
  price: string;

  @Column("int", { name: "user_id", unsigned: true })
  userId: number;
}
