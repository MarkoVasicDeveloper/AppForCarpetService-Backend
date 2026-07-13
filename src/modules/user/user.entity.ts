import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { RefreshToken } from '../auth/entities/refresh-token.entity';
import { Subscriber } from '../subscribers/subscriber.entity';
import { Worker } from '../worker/worker.entity';

@Entity('user', { schema: 'apiperionica' })
export class User {
  @PrimaryGeneratedColumn({ type: 'int', name: 'user_id', unsigned: true })
  userId!: number;

  @Column('varchar', { name: 'name', length: 50, nullable: false })
  name!: string;

  @Column('varchar', { name: 'surname', length: 50, nullable: false })
  surname!: string;

  @Column('varchar', { name: 'email', length: 50, unique: true, nullable: false })
  email!: string;

  @Column('varchar', { name: 'city', length: 50, nullable: true, default: null })
  city!: string | null;

  @Column('varchar', { name: 'address', length: 255, nullable: true, default: null })
  address!: string | null;

  @Column('varchar', { name: 'phone', length: 50, nullable: true, default: null })
  phone!: string | null;

  @Column('varchar', { name: 'password_hash', length: 255 })
  passwordHash!: string;

  @Column({ type: 'boolean', default: false, name: 'is_verified' })
  isVerified!: boolean;

  @Column({ type: 'varchar', nullable: true, name: 'verification_token' })
  verificationToken!: string | null;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens!: RefreshToken[];

  @OneToMany(() => Subscriber, (subscriber) => subscriber.user)
  subscribers!: Subscriber[];

  @OneToMany(() => Worker, (worker) => worker.user)
  workers!: Worker[];
}
