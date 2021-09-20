/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Administrator } from 'entities/Administrator';
import { RefreshToken } from 'entities/RefreshToken';
import { User } from 'entities/User';
import { AdministratorController } from './controller/administrator/administrator.controller';
import { UserController } from './controller/user/user.controller';
import { AdministratorService } from './services/administrator/administrator.service';
import { UserService } from './services/user/user.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'apiperionica',
      entities: [Administrator, User, RefreshToken]
    }),
    TypeOrmModule.forFeature([
      Administrator, User, RefreshToken
    ])
  ],
  controllers: [AdministratorController, UserController],
  providers: [AdministratorService, UserService],
})
export class AppModule {}
