import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ProductsModule } from './products/products.module.js';
import { ConfigModule } from '@nestjs/config';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot(),

    ObserveModule.forRoot({
      appKey: 'DijCBdYxSmPfFDFr',
      appSecret: process.env.APP_SECRET,
      serviceId: 'belajar1',
      }),

    TypeOrmModule.forRoot({
        type: 'better-sqlite3',
        database: 'database.sqlite',
        autoLoadEntities: true,
        synchronize: true,
    }),
    ProductsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
