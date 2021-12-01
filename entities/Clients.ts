import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CarpetReception } from "./CarpetReception";

@Index(
  "name_surname_address_user_id",
  ["name", "surname", "address", "userId"],
  { unique: true }
)
@Entity("clients", { schema: "apiperionica" })
export class Clients {
  @PrimaryGeneratedColumn({ type: "int", name: "clients_id", unsigned: true })
  clientsId: number;

  @Column("varchar", { name: "name", length: 50, default: () => "'0'" })
  name: string;

  @Column("varchar", { name: "surname", length: 50, default: () => "'0'" })
  surname: string;

  @Column("varchar", { name: "address", length: 50, default: () => "'0'" })
  address: string;

  @Column("timestamp", { name: "time_at", default: () => "CURRENT_TIMESTAMP" })
  timeAt: Date;

  @Column("int", { name: "user_id", unsigned: true, default: () => "'0'" })
  userId: number;

  @Column("varchar", { name: "phone", nullable: true, length: 50 })
  phone: string | null;

  @OneToMany(
    () => CarpetReception,
    (carpetReception) => carpetReception.clients
  )
  carpetReceptions: CarpetReception[];
}
