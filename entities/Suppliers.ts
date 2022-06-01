import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("name", ["name"], { unique: true })
@Index("pib", ["pib"], { unique: true })
@Entity("suppliers", { schema: "apiperionica" })
export class Suppliers {
  @PrimaryGeneratedColumn({ type: "int", name: "suppliers_id", unsigned: true })
  suppliersId: number;

  @Column("varchar", {
    name: "name",
    unique: true,
    length: 50,
    default: () => "'0'",
  })
  name: string;

  @Column("varchar", { name: "address", nullable: true, length: 50 })
  address: string | null;

  @Column("varchar", { name: "pib", nullable: true, unique: true, length: 50 })
  pib: string | null;

  @Column("int", { name: "bank_account", nullable: true })
  bankAccount: number | null;

  @Column("int", { name: "costs_id", unsigned: true })
  costsId: number;

  @Column("int", { name: "user_id", unsigned: true })
  userId: number;
}
