import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { RefreshToken } from "./RefreshToken";

@Index("email", ["email"], { unique: true })
@Entity("user", { schema: "apiperionica" })
export class User {
  @PrimaryGeneratedColumn({ type: "int", name: "user_id", unsigned: true })
  userId: number;

  @Column("varchar", { name: "name", length: 50, default: () => "'0'" })
  name: string;

  @Column("varchar", { name: "surname", length: 50, default: () => "'0'" })
  surname: string;

  @Column("varchar", {
    name: "email",
    unique: true,
    length: 50,
    default: () => "'0'",
  })
  email: string;

  @Column("varchar", { name: "city", length: 50, default: () => "'0'" })
  city: string;

  @Column("varchar", { name: "address", length: 255, default: () => "'0'" })
  address: string;

  @Column("varchar", { name: "phone", length: 50, default: () => "'0'" })
  phone: string;

  @Column("varchar", { name: "password_hash", length: 255 })
  passwordHash: string;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];
}
