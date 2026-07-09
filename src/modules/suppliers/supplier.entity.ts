import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

import { CostEntry } from '../cost/entities/cost-entry.entity';

@Entity('suppliers', { schema: 'apiperionica' })
export class Supplier {
  @PrimaryGeneratedColumn({ type: 'int', name: 'suppliers_id', unsigned: true })
  id!: number;

  @Column('varchar', { name: 'name', unique: true, length: 50 })
  name!: string;

  @Column('varchar', { name: 'address', nullable: true, length: 50 })
  address!: string | null;

  @Column('varchar', { name: 'pib', nullable: true, unique: true, length: 50 })
  pib!: string | null;

  @Column('varchar', { name: 'bank_account', nullable: true, length: 50 })
  bankAccount!: string | null;

  @Column('int', { name: 'user_id', unsigned: true })
  userId!: number;

  @OneToMany(() => CostEntry, (cost) => cost.supplier)
  costs!: CostEntry[];
}
