import { BadGatewayException } from '@nestjs/common';
import Redis, { Cluster } from 'ioredis';
import _ from 'lodash';

import { RedisConfig } from './redis.interface';

export function isClusterNodesDefined(cfg: RedisConfig): boolean {
  return !_.isEmpty(_.get(cfg, 'cluster.nodes'));
}

export function createRedisClient(cfg: RedisConfig): Redis {
  return new Redis(cfg.port, cfg.host, {
    ...cfg.options,
  });
}

export function createRedisCluster(cfg: RedisConfig): Cluster {
  if (!isClusterNodesDefined(cfg)) {
    throw new BadGatewayException('cluster.nodes is not defined or is empty');
  }
  return new Redis.Cluster(
    cfg.cluster.nodes,
    _.merge(cfg.cluster.options, { redisOptions: cfg.options }),
  );
}

export function createRedis(cfg: RedisConfig): Redis | Cluster {
  return isClusterNodesDefined(cfg)
    ? createRedisCluster(cfg)
    : createRedisClient(cfg);
}
