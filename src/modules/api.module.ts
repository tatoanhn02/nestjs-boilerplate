import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { pinoConfig } from 'src/config/config.provider';

import { CommonModule } from './common/common.module';
import { HealthModule } from './health/health.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    CommonModule,
    HealthModule,
    RolesModule,
    UsersModule,
    LoggerModule.forRoot({
      pinoHttp: { ...pinoConfig, autoLogging: false },
    }),
  ],
})
export class ApiModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply().forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
