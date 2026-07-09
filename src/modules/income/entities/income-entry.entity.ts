import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

import { IncomeCategory } from './income-category.entity';

@Entity('income_entries', { schema: 'apiperionica' })
export class IncomeEntry {
  @PrimaryGeneratedColumn({ type: 'int', name: 'income_entry_id', unsigned: true })
  id!: number;

  @Column('varchar', { name: 'name', length: 100 })
  name!: string;

  @Column('int', { name: 'category_id', unsigned: true })
  categoryId!: number;

  @Column('int', { name: 'value', unsigned: true })
  value!: number;

  @Column('timestamp', { name: 'date_at', default: () => 'CURRENT_TIMESTAMP' })
  dateAt!: Date;

  @Column('int', { name: 'user_id', unsigned: true })
  userId!: number;

  @ManyToOne(() => IncomeCategory, (category) => category.entries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category!: IncomeCategory;
}
