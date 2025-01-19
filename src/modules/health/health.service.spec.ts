import { INestApplication } from '@nestjs/common';
import { HttpHealthIndicator } from '@nestjs/terminus';

import { initTestApp } from '../../shared/helpers/test.helper';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let app: INestApplication;
  let service: HealthService;

  beforeAll(async () => {
    [app] = await initTestApp((testModule) => {
      testModule.overrideProvider(HttpHealthIndicator).useValue({
        pingCheck: jest.fn(() => Promise.resolve({ status: 'ok' })),
      });
    });
    service = app.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('healthCheck', () => {
    it('should call the health check methods and return health status', async () => {
      await service.healthCheck();
    });
  });
});
