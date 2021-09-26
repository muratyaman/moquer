import { Validator, ValidatorResult } from 'jsonschema';
import { KIND_MODEL } from './constants';
import { IConfig, IDatabase, IEntity, IModel, IRecords, IService } from './types';
import { dbKeySplit } from './utils';

export function makeService(conf: IConfig, db: IDatabase, log = console): IService {

  async function loadAll(asString = true): Promise<IRecords>{
    const rows: IRecords = {};

    const keys = await db.keys();
    const keyObjs = keys.map(dbKeySplit);
    for (let key of keyObjs) {
      const row = await db.retrieve(key.kind, key.id);
      if (!(key.kind in rows)) rows[key.kind] = {}; // init
      rows[key.kind][key.id] = asString ? JSON.stringify(row, null, '  ') : row;
    }

    return rows;
  }

  async function findModel(kind: string): Promise<IModel> {
    return db.retrieve(KIND_MODEL, kind);
  }

  async function findEntity<T = IEntity>(kind: string, id: string): Promise<T> {
    return db.retrieve(kind, id);
  }

  async function findEntities<T = any>(kind: string): Promise<T[]> {
    const rows = [];

    const keys = await db.keys();
    const keyObjs = keys.map(dbKeySplit).filter(k => k.kind === kind);
    for (let key of keyObjs) {
      const row = await db.retrieve(key.kind, key.id);
      rows.push(row);
    }

    return rows;
  }

  async function validate(kind: string, value: any): Promise<ValidatorResult> {
    const v = new Validator();
    const schema = await findModel(kind);
    return v.validate(value, schema);
  }

  return {
    loadAll,
    findModel,
    findEntity,
    findEntities,
    validate,
  };
}
