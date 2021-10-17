import NodeCache from 'node-cache';
import { IConfig, IDatabase, IEntity } from '../../types';
import { dbKey } from '../../utils';

export function makeDb(
  conf: IConfig,
  log = console,
  client = () => new NodeCache({ stdTTL: 0, checkperiod: 0 }),
): IDatabase {
  const _db = client();
  log.info('new cache client is ready');

  async function keys(): Promise<string[]> {
    return _db.keys();
  }

  async function create(kind: string, id: string, value: IEntity): Promise<boolean> {
    const result = _db.set(dbKey(kind, id), value);
    log.info('node-cache set', { kind, id, result });
    return true;
  }

  async function retrieve<T = unknown>(kind: string, id: string): Promise<T> {
    const value = _db.get(dbKey(kind, id));
    if (value !== undefined && value !== null) return value as T;
    throw new Error('record not found: ' + kind + ' ' + id);
  }

  async function update(kind: string, id: string, newValue: IEntity): Promise<boolean> {
    const oldValue = await retrieve(kind, id);
    const finalValue = (oldValue instanceof Object) ? { ...oldValue, ...newValue } : newValue;
    return create(kind, id, finalValue);
  }

  async function delete_(kind: string, id: string): Promise<boolean> {
    const result = _db.del(dbKey(kind, id));
    log.info('node-cache del', { kind, id, result });
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
