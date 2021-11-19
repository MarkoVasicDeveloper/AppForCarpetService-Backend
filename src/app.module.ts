/* eslint-disable prettier/prettier */
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Administrator } from 'entities/Administrator';
import { Carpet } from 'entities/Carpet';
import { CarpetReception } from 'entities/CarpetReception';
import { Clients } from 'entities/Clients';
import { RefreshAdministratorToken } from 'entities/RefreshAdministratorToken';
import { RefreshToken } from 'entities/RefreshToken';
import { SchedulingCarpet } from 'entities/SchedulingCarpet';
import { Subscribers } from 'entities/Subscribers';
import { User } from 'entities/User';
import { Worker } from 'entities/Worker';
import { AuthMiddleware } from './authMiddleware/auth.middleware';
import { AdministratorController } from './controller/administrator/administrator.controller';
import { AnalysisController } from './controller/Analysis/analysis.controller';
import { AuthController } from './controller/auth/auth.controller';
import { CarpetController } from './controller/Carpet/carpet.controller';
import { CarpetReceprionController } from './controller/carpetReceptions/carpet.reception.controller';
import { ClientsContoller } from './controller/clients/clients.controller';
import { RefreshTokenController } from './controller/refreshToken/Refresh.toke.controller';
import SchedulingCarpetController from './controller/Scheduling.Carpet/Scheduking.carpet.controller';
import { SubscribersController } from './controller/Subscribers/subscribers.controller';
import { UserController } from './controller/user/user.controller';
import { WorkerController } from './controller/worker/worker.controller';
import { AdministratorService } from './services/administrator/administrator.service';
import { BuisnessAnalysis } from './services/Analysis/BuisnessAnalysis';
import { CarpetService } from './services/Carpet/carpet.service';
import { CarpetReceptionsService } from './services/carpetReceprion/carpet.reception.service';
import { ClientsService } from './services/clients/clients.service';
import { RefreshTokenService } from './services/refreshToken/refreshToken';
import SchadulingCarpetService from './services/SchedulingCarpet/SchedulingCarpet';
import { SubscibersService } from './services/subscribers/subscribers.service';
import { UserService } from './services/user/user.service';
import { WorkerService } from './services/worker/workers.service';
import { MailerController } from './controller/mailer/mailer.controller';
import { UserMailerService } from './services/mailer/mailer.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'apiperionica',
      entities: [
        Administrator,
        User,
        RefreshToken,
        RefreshAdministratorToken,
        Clients,
        CarpetReception,
        Worker,
        Carpet,
        SchedulingCarpet,
        Subscribers
      ]
    }),
    TypeOrmModule.forFeature([
      Administrator, 
      User, 
      RefreshToken, 
      RefreshAdministratorToken, 
      Clients, 
      CarpetReception,
      Worker,
      Carpet,
      SchedulingCarpet,
      Subscribers
    ])
  ],
  controllers: [
      AdministratorController,
      UserController,
      AuthController,
      ClientsContoller,
      CarpetReceprionController,
      WorkerController,
      CarpetController,
      SchedulingCarpetController,
      AnalysisController,
      RefreshTokenController,
      SubscribersController,
      MailerController
    ],
  providers: [
    AdministratorService,
    UserService,
    ClientsService,
    CarpetReceptionsService,
    WorkerService,
    CarpetService,
    SchadulingCarpetService,
    BuisnessAnalysis,
    RefreshTokenService,
    SubscibersService,
    UserMailerService
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).exclude('auth/*', 'api/user/addUser').forRoutes('api/*')
  }
}
