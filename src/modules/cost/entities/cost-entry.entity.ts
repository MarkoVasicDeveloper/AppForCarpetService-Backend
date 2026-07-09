import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cost_entries', { schema: 'apiperionica' })
export class CostEntry {
  @PrimaryGeneratedColumn({ type: 'int', name: 'cost_id', unsigned: true })
  id!: number;

  @Column('int', { name: 'costs_id', unsigned: true })
  costsId!: number;

  @Column('int', { name: 'suppliers_id', unsigned: true })
  supplierId!: number;

  @Column('varchar', { name: 'product', length: 255 })
  product!: string;

  @Column('int', { name: 'quantity', unsigned: true })
  quantity!: number;

  @Column('int', { name: 'price', unsigned: true })
  price!: number;

  @Column('boolean', { name: 'paid', default: false })
  paid!: boolean;

  @Column('date', { name: 'maturity_date', nullable: true })
  maturityDate!: Date | null;

  @Column('int', { name: 'user_id', unsigned: true })
  userId!: number;
}
