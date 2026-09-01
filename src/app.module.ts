import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ProductsModule } from './products/products.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: 'DijCBdYxSmPfFDFr',
      appSecret: 'bjgd!AsR9CNSCdKUkiSXSH%!P$IFW5XewMm97K^mp&vU5',
      serviceId: 'belajar1',
      }),
    TypeOrmModule.forRoot({
        type: 'sqlite',
        database: 'database.sqlite',
        entities: [__dirname +'/**/*.entity{.ts,.js}'],
        synchronize: true,
    }),
    ProductsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
