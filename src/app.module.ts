/* eslint-disable prettier/prettier */
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Administrator } from 'entities/Administrator';
import { CarpetImages } from 'entities/CarpetImages';
import { CarpetReception } from 'entities/CarpetReception';
import { Clients } from 'entities/Clients';
import { RefreshAdministratorToken } from 'entities/RefreshAdministratorToken';
import { RefreshToken } from 'entities/RefreshToken';
import { User } from 'entities/User';
import { AuthMiddleware } from './authMiddleware/auth.middleware';
import { AdministratorController } from './controller/administrator/administrator.controller';
import { AuthController } from './controller/auth/auth.controller';
import { CarpetReceprionController } from './controller/carpetReceptions/carpet.reception.controller';
import { ClientsContoller } from './controller/clients/clients.controller';
import { UserController } from './controller/user/user.controller';
import { AdministratorService } from './services/administrator/administrator.service';
import { CarpetReceptionsService } from './services/carpetReceprion/carpet.reception.service';
import { ClientsService } from './services/clients/clients.service';
import { UserService } from './services/user/user.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'apiperionica',
      entities: [Administrator, User, RefreshToken, RefreshAdministratorToken, Clients, CarpetReception, CarpetImages]
    }),
    TypeOrmModule.forFeature([
      Administrator, 
      User, 
      RefreshToken, 
      RefreshAdministratorToken, 
      Clients, 
      CarpetReception, 
      CarpetImages
    ])
  ],
  controllers: [
      AdministratorController,
      UserController,
      AuthController,
      ClientsContoller,
      CarpetReceprionController
    ],
  providers: [AdministratorService, UserService, ClientsService, CarpetReceptionsService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).exclude('auth/*').forRoutes('api/*')
  }
}
