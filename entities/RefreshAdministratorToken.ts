import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Administrator } from "./Administrator";

@Index("FK_refresh_administrator_token_administrator", ["administratorId"], {})
@Entity("refresh_administrator_token", { schema: "apiperionica" })
export class RefreshAdministratorToken {
  @PrimaryGeneratedColumn({
    type: "int",
    name: "refresh_administrator_token_id",
    unsigned: true,
  })
  refreshAdministratorTokenId: number;

  @Column("int", { name: "administrator_id", unsigned: true })
  administratorId: number;

  @Column("text", { name: "refresh_administrator_token" })
  refreshAdministratorToken: string;

  @Column("timestamp", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column("datetime", { name: "expire_at" })
  expireAt: Date;

  @Column("tinyint", { name: "is_valid", unsigned: true, default: () => "'1'" })
  isValid: number;

  @ManyToOne(
    () => Administrator,
    (administrator) => administrator.refreshAdministratorTokens,
    { onDelete: "RESTRICT", onUpdate: "CASCADE" }
  )
  @JoinColumn([
    { name: "administrator_id", referencedColumnName: "administratorId" },
  ])
  administrator: Administrator;
}
