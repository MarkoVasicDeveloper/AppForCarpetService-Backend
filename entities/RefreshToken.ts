import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("refresh_token", { schema: "apiperionica" })
export class RefreshToken {
  @PrimaryGeneratedColumn({
    type: "int",
    name: "refresh_token_id",
    unsigned: true,
  })
  refreshTokenId: number;

  @Column("varchar", { name: "identity", length: 50, default: () => "'0'" })
  identity: string;

  @Column("varchar", {
    name: "password_hash",
    length: 255,
    default: () => "'0'",
  })
  passwordHash: string;

  @Column("varchar", { name: "ip_address", length: 32, default: () => "'0'" })
  ipAddress: string;

  @Column("timestamp", {
    name: "expire_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  expireAt: Date;
}
