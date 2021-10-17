import { createClient } from 'redis';
import { promisify } from 'util'; // native module
import { IConfig, IDatabase, IEntity } from '../../types';
import { dbKey } from '../../utils';

export function makeDb(
  conf: IConfig,
  log = console,
  client = () => createClient({
    host: conf.penv.REDIS_HOST ?? '127.0.0.1',
    port: Number.parseInt(conf.penv.REDIS_PORT ?? '6379'),
    user: conf.penv.REDIS_USER ?? undefined,
    password: conf.penv.REDIS_PASSWORD ?? undefined,
  }),
): IDatabase {
  const _db = client();
  log.info('new redis client is ready');

  _db.on('error', log.error);

  const _keys = promisify(_db.keys).bind(_db);
  const _get  = promisify(_db.get).bind(_db);
  const _set  = promisify(_db.set).bind(_db); // insert + update
  const _del  = promisify(_db.del).bind(_db);

  async function keys(): Promise<string[]> {
    return _keys('*'); // search/get all keys
  }

  async function create(kind: string, id: string, value: IEntity): Promise<boolean> {
    const valueStr = JSON.stringify(value);
    const result = await _set(dbKey(kind, id), valueStr);
    log.info('redis set', { kind, id, result });
    return true;
  }

  async function retrieve<T = unknown>(kind: string, id: string): Promise<T> {
    const value = await _get(dbKey(kind, id));
    if (value !== undefined && value !== null) return JSON.parse(value) as T;
    throw new Error('record not found: ' + kind + ' ' + id);
  }

  async function update(kind: string, id: string, newValue: IEntity): Promise<boolean> {
    const oldValue = await retrieve(kind, id);
    const finalValue = (oldValue instanceof Object) ? { ...oldValue, ...newValue } : newValue;
    return create(kind, id, finalValue);
  }

  async function delete_(kind: string, id: string): Promise<boolean> {
    const result = await _del(dbKey(kind, id));
    log.info('redis del', { kind, id, result });
    return true;
  }

  return {
    keys,
    create,
    retrieve,
    update,
    delete_,
  }
}
