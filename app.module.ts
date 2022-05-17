/* eslint-disable prettier/prettier */
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { Administrator } from "entities/Administrator";
import { Carpet } from "entities/Carpet";
import { CarpetReception } from "entities/CarpetReception";
import { Clients } from "entities/Clients";
import { RefreshAdministratorToken } from "entities/RefreshAdministratorToken";
import { RefreshToken } from "entities/RefreshToken";
import { SchedulingCarpet } from "entities/SchedulingCarpet";
import { Subscribers } from "entities/Subscribers";
import { User } from "entities/User";
import { Worker } from "entities/Worker";
import { AuthMiddleware } from "src/authMiddleware/auth.middleware";
import { AdministratorController } from "src/controller/administrator/administrator.controller";
import { AnalysisController } from "src/controller/Analysis/analysis.controller";
import { AuthController } from "src/controller/auth/auth.controller";
import { CarpetController } from "src/controller/Carpet/carpet.controller";
import { CarpetReceprionController } from "src/controller/carpetReceptions/carpet.reception.controller";
import { ClientsContoller } from "src/controller/clients/clients.controller";
import { RefreshTokenController } from "src/controller/refreshToken/Refresh.toke.controller";
import SchedulingCarpetController from "src/controller/Scheduling.Carpet/Scheduking.carpet.controller";
import { SubscribersController } from "src/controller/Subscribers/subscribers.controller";
import { UserController } from "src/controller/user/user.controller";
import { WorkerController } from "src/controller/worker/worker.controller";
import { AdministratorService } from "src/services/administrator/administrator.service";
import { BuisnessAnalysis } from "src/services/Analysis/BuisnessAnalysis";
import { CarpetService } from "src/services/Carpet/carpet.service";
import { CarpetReceptionsService } from "src/services/carpetReceprion/carpet.reception.service";
import { ClientsService } from "src/services/clients/clients.service";
import { RefreshTokenService } from "src/services/refreshToken/refreshToken";
import SchadulingCarpetService from "src/services/SchedulingCarpet/SchedulingCarpet";
import { SubscibersService } from "src/services/subscribers/subscribers.service";
import { UserService } from "src/services/user/user.service";
import { WorkerService } from "src/services/worker/workers.service";
import { MailerController } from "src/controller/mailer/mailer.controller";
import { UserMailerService } from "src/services/mailer/mailer.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Costs } from "entities/Costs";
import { CostsService } from "src/services/Costs/costs.service";
import { CostsController } from "src/controller/Costs/costs.controller";
import { Cost } from "entities/Cost";
import { CostController } from "src/controller/Cost/cost.controller";
import { CostService } from "src/services/Cost/cost.service";
import { Suppliers } from "entities/Suppliers";
import { SuppliersController } from "src/controller/Suppliers/suppliers.controller";
import { SuppliersService } from "src/services/Suppliers/suppliers.service";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "mysql",
      port: 3306,
      host: "localhost",
      username: "root",
      password: "root",
      database: "apiperionica",
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
        Subscribers,
        Costs,
        Cost,
        Suppliers,
      ],
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
      Subscribers,
      Costs,
      Cost,
      Suppliers,
    ]),
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
    MailerController,
    CostsController,
    CostController,
    SuppliersController,
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
    UserMailerService,
    CostsService,
    CostService,
    SuppliersService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude("auth/*", "api/user/addUser")
      .forRoutes("api/*");
  }
}
