import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('income_categories', { schema: 'apiperionica' })
export class IncomeCategory {
  @PrimaryGeneratedColumn({ type: 'int', name: 'income_id', unsigned: true })
  id!: number;

  @Column('varchar', { name: 'name', length: 255 })
  name!: string;

  @Column('int', { name: 'price', unsigned: true })
  price!: number;

  @Column('int', { name: 'user_id', unsigned: true })
  userId!: number;
}
