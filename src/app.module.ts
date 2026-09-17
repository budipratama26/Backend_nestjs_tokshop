import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ProductsModule } from './products/products.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OrdersModule } from './orders/orders.module.js';
import { CommonModule } from './common/common.module.js';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { createObserveModule } from '@nestjs/observe';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import Joi from 'joi';
import { LoggerModule } from 'nestjs-pino';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller.js';
import { ScheduleModule } from '@nestjs/schedule';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production' ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              singleLine: true,
            },
          }
            : undefined,
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3000),
        JWT_SECRET: Joi.string().required().min(32),
        CORS_ORIGIN: Joi.string().optional(),
        DB_TYPE: Joi.string()
          .valid('better-sqlite3', 'postgres', 'mysql')
          .default('better-sqlite3'),
        DB_HOST: Joi.string().default('localhost'),
        DB_PORT: Joi.number().default(5432),
        DB_USERNAME: Joi.string().optional(),
        DB_PASSWORD: Joi.string().optional(),
        DB_DATABASE: Joi.string().default('database.sqlite'),
      }),
    }),

    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),

    ...(process.env.NODE_ENV !== 'test' ? [
      ObserveModule.forRoot({
        appKey: process.env.OBSERVE_APP_KEY || '',
        appSecret: process.env.APP_SECRET || '',
        serviceId: 'be-nestjs',
      }),
    ]
      : []),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: config.get<string>('DB_TYPE') as any,
        ...(config.get<string>('DB_TYPE') === 'better-sqlite3' ? { database: config.get<string>('DB_DATABASE') } : {
          host: config.get<string>('DB_HOST'),
          port: config.get<number>('DB_PORT'),
          username: config.get<string>('DB_USERNAME'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_DATABASE'),
        }),
        autoLoadEntities: true,
        synchronize: false,
        migrationsRun: config.get<string>('NODE_ENV') !== 'test',
        migrations: ['dist/migrations/*.js'],
      }),
    }),
    ProductsModule,
    UsersModule,
    AuthModule,
    OrdersModule,
    CommonModule,
    TerminusModule,

    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
  ScheduleModule.forRoot(),
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
