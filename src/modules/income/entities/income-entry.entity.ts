import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('income_entries', { schema: 'apiperionica' })
export class IncomeEntry {
  @PrimaryGeneratedColumn({ type: 'int', name: 'income_entry_id', unsigned: true })
  id!: number;

  @Column('int', { name: 'income_id', unsigned: true })
  incomeId!: number;

  @Column('int', { name: 'value', unsigned: true })
  value!: number;

  @Column('timestamp', { name: 'date_at', default: () => 'CURRENT_TIMESTAMP' })
  dateAt!: Date;

  @Column('int', { name: 'user_id', unsigned: true })
  userId!: number;
}
