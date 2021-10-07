import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("name", ["name"], { unique: true })
@Entity("worker", { schema: "apiperionica" })
export class Worker {
  @PrimaryGeneratedColumn({ type: "int", name: "worker_id", unsigned: true })
  workerId: number;

  @Column("varchar", {
    name: "name",
    unique: true,
    length: 50,
    default: () => "'0'",
  })
  name: string;

  @Column("varchar", { name: "password", length: 255, default: () => "'0'" })
  password: string;
}
