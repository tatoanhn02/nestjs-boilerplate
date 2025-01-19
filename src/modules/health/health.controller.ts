import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthCheck } from '@nestjs/terminus';

import { EApiTags } from '../../shared/enums/api-tags.enum';
import { HealthService } from './health.service';

@ApiTags(EApiTags.HEALTH_CHECK)
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({
    description: 'Health check endpoint',
    operationId: 'healthCheck',
  })
  @HealthCheck()
  async healthCheck() {
    return this.healthService.healthCheck();
  }
}
