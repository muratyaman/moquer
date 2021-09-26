import { IConfig, IDatabase } from '../types';
import * as cache from './cache';

export function makeDb(conf: IConfig): IDatabase {
  if (conf.db.kind === 'cache') {
    return cache.makeDb(conf);
  }
  throw new Error('Unknown database kind' + conf.db.kind);
}
