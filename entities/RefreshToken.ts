import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";

@Index("fk_user{token_user_id", ["userId"], {})
@Entity("refresh_token", { schema: "apiperionica" })
export class RefreshToken {
  @PrimaryGeneratedColumn({
    type: "int",
    name: "refresh_token_id",
    unsigned: true,
  })
  refreshTokenId: number;

  @Column("datetime", { name: "expire_at" })
  expireAt: Date;

  @Column("int", { name: "user_id", unsigned: true })
  userId: number;

  @Column("text", { name: "refresh_token" })
  refreshToken: string;

  @Column("timestamp", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column("tinyint", { name: "is_valid", unsigned: true, default: () => "'1'" })
  isValid: number;

  @ManyToOne(() => User, (user) => user.refreshTokens, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
  user: User;
}
