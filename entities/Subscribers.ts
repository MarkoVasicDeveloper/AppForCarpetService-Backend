import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";

@Index("FK__user", ["userId"], {})
@Entity("subscribers", { schema: "apiperionica" })
export class Subscribers {
  @PrimaryGeneratedColumn({
    type: "int",
    name: "subscribers_id",
    unsigned: true,
  })
  subscribersId: number;

  @Column("int", { name: "user_id", unsigned: true, default: () => "'0'" })
  userId: number;

  @Column("date", { name: "time_at", default: () => "'curdate()'" })
  timeAt: string;

  @Column("date", { name: "expire_at" })
  expireAt: string;

  @Column("int", { name: "price", nullable: true, default: () => "'0'" })
  price: number | null;

  @ManyToOne(() => User, (user) => user.subscribers, {
    onDelete: "NO ACTION",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
  user: User;
}
