import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdministratorModule } from 'src/modules/administrator/administrator.module';
import { AnalysisModule } from 'src/modules/analysis/analysis.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { CarpetModule } from 'src/modules/carpet/carpet.module';
import { CarpetReceptionModule } from 'src/modules/carpet-receptions/carpet-reception.module';
import { ClientsModule } from 'src/modules/clients/clients.module';
import { CostModule } from 'src/modules/cost/cost.module';
import { IncomeModule } from 'src/modules/income/income.module';
import { NotificationModule } from 'src/modules/notification/notification.module';
import { SchedulingCarpetModule } from 'src/modules/scheduling-carpet/scheduling-carpet.module';
import { SubscriberModule } from 'src/modules/subscribers/subscriber.module';
import { SupplierModule } from 'src/modules/suppliers/supplier.module';
import { UserModule } from 'src/modules/user/user.module';
import { WorkerModule } from 'src/modules/worker/worker.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      port: Number(process.env.DB_PORT) || 3306,
      host: process.env.DB_HOST,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: true,
      logging: true,
      autoLoadEntities: true,
    }),
    EventEmitterModule.forRoot(),
    NotificationModule,
    ClientsModule,
    CarpetModule,
    CarpetReceptionModule,
    IncomeModule,
    WorkerModule,
    UserModule,
    AdministratorModule,
    SupplierModule,
    SchedulingCarpetModule,
    SubscriberModule,
    CostModule,
    AnalysisModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
