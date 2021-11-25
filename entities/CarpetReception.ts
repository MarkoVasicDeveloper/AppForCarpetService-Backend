import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Clients } from "./Clients";

@Index("FK_carpet_reception_clients", ["clientsId"], {})
@Index("user_id", ["userId"], {})
@Entity("carpet_reception", { schema: "apiperionica" })
export class CarpetReception {
  @PrimaryGeneratedColumn({
    type: "int",
    name: "carpet_reception",
    unsigned: true,
  })
  carpetReception: number;

  @Column("int", { name: "carpet_reception_user", unsigned: true })
  carpetReceptionUser: number;

  @Column("int", { name: "clients_id", unsigned: true, default: () => "'0'" })
  clientsId: number;

  @Column("int", { name: "user_id", unsigned: true, default: () => "'0'" })
  userId: number;

  @Column("int", { name: "worker_id", unsigned: true })
  workerId: number;

  @Column("int", { name: "number_of_carpet", nullable: true })
  numberOfCarpet: number | null;

  @Column("int", { name: "number_of_tracks", nullable: true })
  numberOfTracks: number | null;

  @Column("text", { name: "note", nullable: true })
  note: string | null;

  @Column("timestamp", { name: "time_at", default: () => "CURRENT_TIMESTAMP" })
  timeAt: Date;

  @Column("tinyint", { name: "prepare", width: 1, default: () => "'0'" })
  prepare: boolean;

  @Column("tinyint", {
    name: "delivered",
    nullable: true,
    width: 1,
    default: () => "'0'",
  })
  delivered: boolean | null;

  @Column("datetime", { name: "deliveryTime", nullable: true })
  deliveryTime: Date | null;

  @Column("date", { name: "date_at", default: () => "'curdate()'" })
  dateAt: string;

  @ManyToOne(() => Clients, (clients) => clients.carpetReceptions, {
    onDelete: "NO ACTION",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "clients_id", referencedColumnName: "clientsId" }])
  clients: Clients;
}
