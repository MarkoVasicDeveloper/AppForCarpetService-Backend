import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cost_categories', { schema: 'apiperionica' })
export class CostCategory {
  @PrimaryGeneratedColumn({ type: 'int', name: 'costs_id', unsigned: true })
  id!: number;

  @Column('varchar', { name: 'title', unique: true, length: 50 })
  title!: string;

  @Column('int', { name: 'user_id', unsigned: true })
  userId!: number;
}
