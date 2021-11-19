import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("carpet", { schema: "apiperionica" })
export class Carpet {
  @PrimaryGeneratedColumn({ type: "int", name: "carpet_id", unsigned: true })
  carpetId: number;

  @Column("int", { name: "carpet_reception_user", unsigned: true })
  carpetReceptionUser: number;

  @Column("int", {
    name: "carpet_reception",
    nullable: true,
    default: () => "'0'",
  })
  carpetReception: number | null;

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

  @Column("int", { name: "userId", unsigned: true })
  userId: number;

  @Column("int", { name: "clients_id", unsigned: true })
  clientsId: number;
}
