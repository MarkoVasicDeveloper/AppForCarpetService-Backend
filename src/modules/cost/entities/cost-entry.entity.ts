import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

import { Supplier } from '../../suppliers/supplier.entity';

import { CostCategory } from './cost-category.entity';

@Entity('cost_entries', { schema: 'apiperionica' })
export class CostEntry {
  @PrimaryGeneratedColumn({ type: 'int', name: 'cost_id', unsigned: true })
  id!: number;

  @Column('int', { name: 'category_id', unsigned: true })
  categoryId!: number;

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

  @ManyToOne(() => CostCategory, (category) => category.entries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category!: CostCategory;

  @ManyToOne(() => Supplier, (supplier) => supplier.costs, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'suppliers_id' })
  supplier!: Supplier;
}
