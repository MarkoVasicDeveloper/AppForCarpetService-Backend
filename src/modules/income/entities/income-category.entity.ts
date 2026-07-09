import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

import { IncomeEntry } from './income-entry.entity';

@Entity('income_categories', { schema: 'apiperionica' })
export class IncomeCategory {
  @PrimaryGeneratedColumn({ type: 'int', name: 'category_id', unsigned: true })
  id!: number;

  @Column('varchar', { name: 'name', length: 50 })
  name!: string;

  @Column('int', { name: 'user_id', unsigned: true })
  userId!: number;

  @OneToMany(() => IncomeEntry, (entry) => entry.category)
  entries!: IncomeEntry[];
}
