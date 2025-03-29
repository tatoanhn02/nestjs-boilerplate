import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import Redis, { RedisOptions } from 'ioredis';

export interface RedisModuleOptions {
  connectionOptions: RedisOptions;
}

export interface RedisAsyncModuleOptions {
  imports?: any[];
  useFactory: (
    ...args: any[]
  ) => Promise<RedisModuleOptions> | RedisModuleOptions;
  inject?: any[];
}

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({})
export class RedisModule {
  static register(options: RedisModuleOptions): DynamicModule {
    const redisProvider: Provider = {
      provide: REDIS_CLIENT,
      useValue: new Redis(options.connectionOptions),
    };

    return {
      module: RedisModule,
      providers: [redisProvider],
      exports: [redisProvider],
    };
  }

  static registerAsync(options: RedisAsyncModuleOptions): DynamicModule {
    const redisProvider: Provider = {
      provide: REDIS_CLIENT,
      useFactory: async (...args: any[]) => {
        const redisOptions = await options.useFactory(...args);
        return new Redis(redisOptions.connectionOptions);
      },
      inject: options.inject || [],
    };

    return {
      module: RedisModule,
      imports: options.imports || [],
      providers: [redisProvider],
      exports: [redisProvider],
    };
  }
}
