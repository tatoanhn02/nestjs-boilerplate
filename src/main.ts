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
import { infoLog } from './shared/helpers/logger.helper';
import { initializeSwagger } from './shared/helpers/swagger.helper';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await setupApplication(app);
  await initializeSwagger(app);

  await app.listen(SERVER_PORT);
}
bootstrap().then(() => {
  infoLog(`${SERVICE_NAME} API service started.`);
  infoLog(`Started on http(s)://${HOST_NAME}${SERVICE_BASE_URL}`);
  infoLog(`Docs available on http(s)://${HOST_NAME}${SERVICE_DOCS_BASE_URL}`);
});
