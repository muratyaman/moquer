import { IConfig, IDatabase } from '../types';
import * as cache from './cache';
import * as pgsql from './pgsql';
import * as redis from './redis';

export function makeDb(conf: IConfig, log = console): IDatabase {
  if (conf.db.kind === 'cache') {
    return cache.makeDb(conf, log);
  }
  if (conf.db.kind === 'pgsql') {
    return pgsql.makeDb(conf, log);
  }
  if (conf.db.kind === 'redis') {
    return redis.makeDb(conf, log);
  }
  throw new Error('Unknown database kind' + conf.db.kind);
}
