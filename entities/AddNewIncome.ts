import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("add_new_income", { schema: "apiperionica" })
export class AddNewIncome {
  @PrimaryGeneratedColumn({
    type: "int",
    name: "add_new_income_id",
    unsigned: true,
  })
  addNewIncomeId: number;

  @Column("int", { name: "income_id", unsigned: true, default: () => "'0'" })
  incomeId: number;

  @Column("int", { name: "value", default: () => "'0'" })
  value: number;

  @Column("timestamp", { name: "date_at", default: () => "CURRENT_TIMESTAMP" })
  dateAt: Date;

  @Column("int", { name: "user_id", unsigned: true })
  userId: number;
}
