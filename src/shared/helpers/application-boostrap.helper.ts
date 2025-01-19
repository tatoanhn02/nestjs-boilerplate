import { INestApplication } from '@nestjs/common';

import { SERVICE_BASE_URL } from '../../config/config.provider';
import {
  LoggerInterceptor,
  setCorrelationId,
} from '../../interceptors/logger.interceptor';

export const setupApplication = async (
  app: INestApplication,
): Promise<void> => {
  app.setGlobalPrefix(`${SERVICE_BASE_URL}`);
  app.useGlobalInterceptors(new LoggerInterceptor());
  app.use(setCorrelationId);
};
