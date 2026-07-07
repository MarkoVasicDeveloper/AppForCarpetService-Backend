import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Clients } from '../clients/clients.entity';
import { User } from '../user/user.entity';
import { Worker } from '../worker/worker.entity';

@Entity('carpet', { schema: 'apiperionica' })
export class Carpet {
  @PrimaryGeneratedColumn({ type: 'int', name: 'carpet_id', unsigned: true })
  carpetId!: number;

  @Column('int', { name: 'carpet_reception_user', unsigned: true })
  carpetReceptionUser!: number;

  @Column('int', { name: 'carpet_reception', nullable: true, default: 0 })
  carpetReception!: number | null;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  width!: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  height!: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  price!: number;

  @Column('decimal', { name: 'carpet_surface', precision: 7, scale: 2 })
  carpetSurface!: number;

  @Column('decimal', { name: 'for_payment', precision: 12, scale: 2 })
  forPayment!: number;

  @Column('int', { name: 'worker_id', unsigned: true })
  workerId!: number;

  @ManyToOne(() => Worker, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'worker_id' })
  worker!: Worker;

  @Column('int', { name: 'user_id', unsigned: true })
  userId!: number;

  @ManyToOne(() => User, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column('int', { name: 'clients_id', unsigned: true })
  clientsId!: number;

  @ManyToOne(() => Clients, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'clients_id' })
  client!: Clients;

  @Column('date', { name: 'delivery_time' })
  deliveryTime!: string;

  @CreateDateColumn({ name: 'time_at' })
  timeAt!: Date;
}
