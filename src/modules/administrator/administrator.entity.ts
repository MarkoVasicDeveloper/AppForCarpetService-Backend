import { RefreshAdministratorToken } from 'src/modules/auth/entities/refresh-administrator-token.entity';
import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Index('username', ['username'], { unique: true })
@Entity('administrator', { schema: 'apiperionica' })
export class Administrator {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'administrator_id',
    unsigned: true,
  })
  administratorId!: number;

  @Column('varchar', {
    name: 'username',
    unique: true,
    length: 50,
    default: () => "'0'",
  })
  username!: string;

  @Column('varchar', {
    name: 'password_hash',
    length: 255,
    default: () => "'0'",
  })
  passwordHash!: string;

  @OneToMany(
    () => RefreshAdministratorToken,
    (refreshAdministratorToken) => refreshAdministratorToken.administrator,
  )
  refreshAdministratorTokens!: RefreshAdministratorToken[];
}
