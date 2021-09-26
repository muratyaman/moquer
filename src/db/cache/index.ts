import NodeCache from 'node-cache';
import { IConfig, IDatabase } from '../../types';
import { dbKey } from '../../utils';

export function makeDb(conf: IConfig): IDatabase {
  const _db = new NodeCache({
    stdTTL: 0,
    checkperiod: 0,
  });

  async function keys(): Promise<string[]> {
    return _db.keys();
  }

  async function create(kind: string, id: string, data: any): Promise<boolean> {
    _db.set(dbKey(kind, id), data);
    return true;
  }

  async function retrieve<T = unknown>(kind: string, id: string): Promise<T> {
    const out = _db.get(dbKey(kind, id));
    if (out !== undefined && out !== null) return out as T;
    throw new Error('record not found: ' + kind + ' ' + id);
  }

  async function update(kind: string, id: string, newData: any): Promise<boolean> {
    const oldData = await retrieve(kind, id);
    const finalData = oldData && (oldData instanceof Object) ? { ...oldData, ...newData } : newData;
    _db.set(dbKey(kind, id), finalData);
    return true;
  }

  async function delete_(kind: string, id: string): Promise<boolean> {
    _db.del(dbKey(kind, id));
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
