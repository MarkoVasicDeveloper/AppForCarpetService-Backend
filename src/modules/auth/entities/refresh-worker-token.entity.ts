import { Worker } from 'src/modules/worker/worker.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('refresh_worker_token', { schema: 'apiperionica' })
export class RefreshWorkerToken {
  @PrimaryGeneratedColumn({ type: 'int', name: 'refresh_worker_token_id', unsigned: true })
  refreshWorkerTokenId!: number;

  @Column('int', { name: 'worker_id', unsigned: true })
  workerId!: number;

  @Column({ type: 'text', name: 'refresh_worker_token' })
  refreshWorkerToken!: string;

  @Column('datetime', { name: 'expire_at' })
  expireAt!: Date;

  @Column('tinyint', { name: 'is_valid', default: 1 })
  isValid!: number;

  @ManyToOne(() => Worker, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'worker_id' })
  worker!: Worker;
}
