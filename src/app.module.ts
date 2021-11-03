/* eslint-disable prettier/prettier */
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Administrator } from 'entities/Administrator';
import { Carpet } from 'entities/Carpet';
import { CarpetImages } from 'entities/CarpetImages';
import { CarpetReception } from 'entities/CarpetReception';
import { Clients } from 'entities/Clients';
import { RefreshAdministratorToken } from 'entities/RefreshAdministratorToken';
import { RefreshToken } from 'entities/RefreshToken';
import { SchedulingCarpet } from 'entities/SchedulingCarpet';
import { User } from 'entities/User';
import { Worker } from 'entities/Worker';
import { AuthMiddleware } from './authMiddleware/auth.middleware';
import { AdministratorController } from './controller/administrator/administrator.controller';
import { AnalysisController } from './controller/Analysis/analysis.controller';
import { AuthController } from './controller/auth/auth.controller';
import { CarpetController } from './controller/Carpet/carpet.controller';
import { CarpetImagesController } from './controller/carpetImages/carpet.images.controller';
import { CarpetReceprionController } from './controller/carpetReceptions/carpet.reception.controller';
import { ClientsContoller } from './controller/clients/clients.controller';
import SchedulingCarpetController from './controller/Scheduling.Carpet/Scheduking.carpet.controller';
import { UserController } from './controller/user/user.controller';
import { WorkerController } from './controller/worker/worker.controller';
import { AdministratorService } from './services/administrator/administrator.service';
import { BuisnessAnalysis } from './services/Analysis/BuisnessAnalysis';
import { CarpetService } from './services/Carpet/carpet.service';
import { CarpetReceptionsService } from './services/carpetReceprion/carpet.reception.service';
import { ClientsService } from './services/clients/clients.service';
import { ImagesService } from './services/images/images.service';
import SchadulingCarpetService from './services/SchedulingCarpet/SchedulingCarpet';
import { UserService } from './services/user/user.service';
import { WorkerService } from './services/worker/workers.service';

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
        CarpetImages,
        Worker,
        Carpet,
        SchedulingCarpet
      ]
    }),
    TypeOrmModule.forFeature([
      Administrator, 
      User, 
      RefreshToken, 
      RefreshAdministratorToken, 
      Clients, 
      CarpetReception, 
      CarpetImages,
      Worker,
      Carpet,
      SchedulingCarpet
    ])
  ],
  controllers: [
      AdministratorController,
      UserController,
      AuthController,
      ClientsContoller,
      CarpetReceprionController,
      CarpetImagesController,
      WorkerController,
      CarpetController,
      SchedulingCarpetController,
      AnalysisController
    ],
  providers: [
    AdministratorService,
    UserService,
    ClientsService,
    CarpetReceptionsService,
    ImagesService,
    WorkerService,
    CarpetService,
    SchadulingCarpetService,
    BuisnessAnalysis
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).exclude('auth/*', 'api/user/addUser').forRoutes('api/*')
  }
}
