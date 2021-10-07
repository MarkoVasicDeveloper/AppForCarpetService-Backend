import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CarpetImages } from "./CarpetImages";
import { Clients } from "./Clients";

@Index("fk1", ["clientsId"], {})
@Entity("carpet_reception", { schema: "apiperionica" })
export class CarpetReception {
  @PrimaryGeneratedColumn({
    type: "int",
    name: "carpet_reception",
    unsigned: true,
  })
  carpetReception: number;

  @Column("int", { name: "clients_id", unsigned: true, default: () => "'0'" })
  clientsId: number;

  @Column("int", { name: "worker_id", unsigned: true })
  workerId: number;

  @Column("int", { name: "number_of_carpet", default: () => "'0'" })
  numberOfCarpet: number;

  @Column("int", { name: "number_of_tracks", default: () => "'0'" })
  numberOfTracks: number;

  @Column("text", { name: "note", nullable: true })
  note: string | null;

  @OneToMany(() => CarpetImages, (carpetImages) => carpetImages.carpetReception)
  carpetImages: CarpetImages[];

  @ManyToOne(() => Clients, (clients) => clients.carpetReceptions, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "clients_id", referencedColumnName: "clientsId" }])
  clients: Clients;
}
