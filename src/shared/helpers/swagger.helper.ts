import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import config from 'config';

import { SERVICE_DOCS_BASE_URL } from '../../config/config.provider';

const SERVICE_NAME: string = config.get('service.name');
const SERVICE_API_VERSION: string = config.get('service.appVersion');

export const initializeSwagger = async (
  app: INestApplication,
): Promise<void> => {
  const server = app.getHttpAdapter();
  const swaggerConfig = new DocumentBuilder()
    .setTitle(`${SERVICE_NAME} API specs.`)
    .setDescription(
      `API specification for ${SERVICE_NAME} service | [swagger.json](${SERVICE_DOCS_BASE_URL}/swagger.json)`,
    )
    .setVersion(SERVICE_API_VERSION)
    .addBearerAuth({ type: 'apiKey', name: 'access-token', in: 'header' })
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  server.get(`${SERVICE_DOCS_BASE_URL}/swagger.json`, (_, res) => {
    res.json(document);
  });

  SwaggerModule.setup(`${SERVICE_DOCS_BASE_URL}`, app, document, {
    swaggerOptions: {
      displayOperationId: true,
    },
  });
};
