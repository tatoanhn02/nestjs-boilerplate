import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import {
  HOST_NAME,
  SERVER_PORT,
  SERVICE_BASE_URL,
  SERVICE_DOCS_BASE_URL,
  SERVICE_NAME,
} from './config/config.provider';
import { setupApplication } from './shared/helpers/application-boostrap.helper';
import { initializeSwagger } from './shared/helpers/swagger.helper';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await setupApplication(app);
  await initializeSwagger(app);

  await app.listen(SERVER_PORT);
}
bootstrap().then(() => {
  Logger.log(`${SERVICE_NAME} API service started.`);
  Logger.log(`Started on http(s)://${HOST_NAME}${SERVICE_BASE_URL}`);
  Logger.log(
    `Docs available on http(s)://${HOST_NAME}${SERVICE_DOCS_BASE_URL}`,
  );
});
