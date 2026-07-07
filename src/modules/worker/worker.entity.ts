import { Exclude } from 'class-transformer';
import { User } from 'src/modules/user/user.entity';
import { Column, Entity, Index, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('worker', { schema: 'apiperionica' })
@Index('uq_worker_name', ['name'], { unique: true })
export class Worker {
  @PrimaryGeneratedColumn({ type: 'int', name: 'worker_id', unsigned: true })
  workerId!: number;

  @Column('varchar', {
    name: 'name',
    length: 50,
    nullable: false,
  })
  name!: string;

  @Column('varchar', {
    name: 'password',
    length: 255,
    nullable: false,
  })
  @Exclude()
  password!: string;

  @Column('int', { name: 'user_id', unsigned: true })
  userId!: number;

  @ManyToOne(() => User, (user) => user.workers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
