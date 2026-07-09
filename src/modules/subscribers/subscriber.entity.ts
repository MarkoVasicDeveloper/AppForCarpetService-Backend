import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from '../user/user.entity';

@Index('FK__user', ['userId'], {})
@Entity('subscribers', { schema: 'apiperionica' })
export class Subscriber {
  @PrimaryGeneratedColumn({ type: 'int', name: 'subscribers_id', unsigned: true })
  id!: number;

  @Column('int', { name: 'user_id', unsigned: true })
  userId!: number;

  @Column('timestamp', { name: 'time_at', default: () => 'CURRENT_TIMESTAMP' })
  timeAt!: Date;

  @Column('date', { name: 'expire_at' })
  expireAt!: Date;

  @Column('int', { name: 'price', unsigned: true })
  price!: number;

  @ManyToOne(() => User, (user) => user.subscribers, {
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'userId' }])
  user!: User;
}
