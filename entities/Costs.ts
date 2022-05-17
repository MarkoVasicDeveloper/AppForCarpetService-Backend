import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("title", ["title"], { unique: true })
@Entity("costs", { schema: "apiperionica" })
export class Costs {
  @PrimaryGeneratedColumn({ type: "int", name: "costs_id", unsigned: true })
  costsId: number;

  @Column("varchar", {
    name: "title",
    unique: true,
    length: 50,
    default: () => "'0'",
  })
  title: string;

  @Column("int", { name: "user_id", unsigned: true })
  userId: number;
}
