import { RequestMethod } from '@nestjs/common';
import { RouteInfo } from '@nestjs/common/interfaces';

export const EXCLUDED_LOGGER_MIDDLEWARE_ROUTES: RouteInfo[] = [
  { path: '/health', method: RequestMethod.GET },
  { path: '/auth/admin-login', method: RequestMethod.POST },
];
