import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('scheduling_carpets', { schema: 'apiperionica' })
export class SchedulingCarpet {
  @PrimaryGeneratedColumn({ type: 'int', name: 'scheduling_carpet_id', unsigned: true })
  id!: number;

  @Column('varchar', { name: 'name', length: 50 })
  name!: string;

  @Column('varchar', { name: 'surname', length: 50 })
  surname!: string;

  @Column('varchar', { name: 'address', length: 150 })
  address!: string;

  @Column('varchar', { name: 'phone', length: 50 })
  phone!: string;

  @Column('varchar', { name: 'email', nullable: true, length: 50 })
  email!: string | null;

  @Column('varchar', { name: 'note', nullable: true, length: 255 })
  note!: string | null;

  @Column('timestamp', { name: 'time_at', default: () => 'CURRENT_TIMESTAMP' })
  timeAt!: Date;

  @Column('boolean', { name: 'is_scheduling', default: false })
  isScheduling!: boolean;

  @Column('int', { name: 'user_id', unsigned: true })
  userId!: number;
}
