import * as Redis from 'ioredis';

export type RedisOptions = Omit<Omit<Redis.RedisOptions, 'host'>, 'port'>;

export type ClusterNode = Redis.ClusterNode;

export interface ClusterOptions
  extends Omit<Redis.ClusterOptions, 'redisOptions'> {
  keyPrefix?: string;
}

export interface RedisClusterConfig {
  nodes: ClusterNode[];
  options?: ClusterOptions;
}

export interface RedisConfig {
  host?: string;
  port?: number;
  options?: RedisOptions;
  cluster?: RedisClusterConfig;
}
