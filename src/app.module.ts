import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { getMongooseConfig } from './config/config.provider';
import { ApiModule } from './modules/api.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({ useFactory: () => getMongooseConfig() }),
    ApiModule,
  ],
})
export class AppModule {}
