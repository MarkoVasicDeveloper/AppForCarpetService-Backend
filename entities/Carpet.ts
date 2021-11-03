import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CarpetReception } from "./CarpetReception";

@Index("FK_carpet_carpet_reception", ["carpetReception"], {})
@Entity("carpet", { schema: "apiperionica" })
export class Carpet {
  @PrimaryGeneratedColumn({ type: "int", name: "carpet_id", unsigned: true })
  carpetId: number;

  @Column("int", {
    name: "carpet_reception",
    unsigned: true,
    default: () => "'0'",
  })
  carpetReception: number;

  @Column("int", { name: "width", default: () => "'0'" })
  width: number;

  @Column("int", { name: "heigth", default: () => "'0'" })
  heigth: number;

  @Column("int", { name: "price", default: () => "'0'" })
  price: number;

  @Column("int", { name: "carpet_surface" })
  carpetSurface: number;

  @Column("int", { name: "for_payment" })
  forPayment: number;

  @Column("int", { name: "worker_id" })
  workerId: number;

  @Column("date", { name: "deliveryTime" })
  deliveryTime: string;

  @Column("date", { name: "time_at", default: () => "'curdate()'" })
  timeAt: string;

  @ManyToOne(
    () => CarpetReception,
    (carpetReception) => carpetReception.carpets,
    { onDelete: "NO ACTION", onUpdate: "CASCADE" }
  )
  @JoinColumn([
    { name: "carpet_reception", referencedColumnName: "carpetReception" },
  ])
  carpetReception2: CarpetReception;
}
