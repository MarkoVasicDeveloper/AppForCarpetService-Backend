import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("scheduling_carpet", { schema: "apiperionica" })
export class SchedulingCarpet {
  @PrimaryGeneratedColumn({
    type: "int",
    name: "scheduling_carpet_id",
    unsigned: true,
  })
  schedulingCarpetId: number;

  @Column("varchar", { name: "name", length: 50, default: () => "'0'" })
  name: string;

  @Column("varchar", { name: "surname", length: 50, default: () => "'0'" })
  surname: string;

  @Column("varchar", { name: "address", length: 50, default: () => "'0'" })
  address: string;

  @Column("varchar", { name: "email", nullable: true, length: 50 })
  email: string | null;

  @Column("varchar", { name: "note", nullable: true, length: 255 })
  note: string | null;

  @Column("timestamp", { name: "time_at", default: () => "CURRENT_TIMESTAMP" })
  timeAt: Date;

  @Column("varchar", { name: "phone", length: 50, default: () => "'0'" })
  phone: string;

  @Column("tinyint", { name: "is_scheduling", width: 1, default: () => "'0'" })
  isScheduling: boolean;

  @Column("int", { name: "user_id", unsigned: true })
  userId: number;
}
