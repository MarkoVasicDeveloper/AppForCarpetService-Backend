import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthMiddleware } from 'src/authMiddleware/auth.middleware';
import { AdministratorModule } from 'src/modules/administrator/administrator.module';
import { AnalysisModule } from 'src/modules/analysis/analysis.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { CarpetModule } from 'src/modules/carpet/carpet.module';
import { CarpetReceprionModule } from 'src/modules/carpetReceptions/carpet.reception.module';
import { ClientsModule } from 'src/modules/clients/clients.module';
import { CostModule } from 'src/modules/cost/cost.module';
import { CostsModule } from 'src/modules/costs/costs.module';
import { IncomeModule } from 'src/modules/income/income.module';
import { MailerModule } from 'src/modules/mailer/mailer.module';
import { NewIncomeModule } from 'src/modules/newIncome/new.income.module';
import { SchedulingCarpetModule } from 'src/modules/schedulingCarpet/scheduling.carpet.module';
import { SubscibresModule } from 'src/modules/subscribers/subscibers.module';
import { SuppliersModule } from 'src/modules/suppliers/suppliers.module';
import { RefreshTokenModule } from 'src/modules/token/refresh.token.module';
import { UserModule } from 'src/modules/user/user.module';
import { WorkerModule } from 'src/modules/worker/worker.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      port: 3306,
      host: 'localhost',
      username: 'root',
      password: 'root',
      database: 'apiperionica',
      synchronize: true,
      logging: true,
      entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
    }),
    ClientsModule,
    CarpetModule,
    CarpetReceprionModule,
    IncomeModule,
    WorkerModule,
    UserModule,
    AdministratorModule,
    RefreshTokenModule,
    SuppliersModule,
    SchedulingCarpetModule,
    SubscibresModule,
    CostModule,
    CostsModule,
    NewIncomeModule,
    MailerModule,
    AnalysisModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).exclude('auth/*', 'api/user/addUser').forRoutes('api/*');
  }
}
