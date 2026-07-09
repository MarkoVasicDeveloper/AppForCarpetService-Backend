import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

import { CostEntry } from './cost-entry.entity';

@Entity('cost_categories', { schema: 'apiperionica' })
export class CostCategory {
  @PrimaryGeneratedColumn({ type: 'int', name: 'category_id', unsigned: true })
  id!: number;

  @Column('varchar', { name: 'title', unique: true, length: 50 })
  title!: string;

  @Column('int', { name: 'user_id', unsigned: true })
  userId!: number;

  @OneToMany(() => CostEntry, (entry) => entry.category)
  entries!: CostEntry[];
}
