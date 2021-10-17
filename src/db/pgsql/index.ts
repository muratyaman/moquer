import md5 from 'md5';
import { Pool } from 'pg';
import { IConfig, IDatabase, IEntity } from '../../types';
import { dbKey } from '../../utils';

export function makeDb(
  conf: IConfig,
  log = console,
  client = () => new Pool(),
): IDatabase {
  const _db = client();
  log.info('new pgsql client is ready');

  async function query(text: string, params: unknown[] = []) {
    const name = md5(text);
    const input = { text, values: params, name };
    log.debug('pgsql query start', input);
    const t = Date.now();
    const result = await _db.query(input);
    const { command, rowCount } = result; // also includes oid, rows, fields
    log.debug('pgsql query end', { command, rowCount, time: Date.now() - t });
    return result;
  }

  function wrap(name): string {
    return `"${name}"`;
  }

  function ph(params = []): string {
    // insert param to params before generating place holder
    const p = params.length;
    return `\$${p}`;
  }

  function makeWhere(filters: IEntity = {}, params: unknown[] = [], glue = ' = '): string[] {
    const where: string[] = [];
    Object.entries(filters).forEach(([ field , value ]) => {
      if (Array.isArray(value)) {
        const vList = value.map(v => { params.push(v); return ph(params); }).join(', ');
        where.push(`${wrap(field)} IN (${vList})`);
      } else {
        params.push(value);
        where.push(wrap(field) + glue + ph(params));
      }
    });
    return where;
  }

  function makeWhereClause(filters: IEntity = {}, params: unknown[] = [], glue = ' = '): string {
    const where = makeWhere(filters, params);
    return where.length ? ' WHERE ' + where.join(' AND ') : '';
  }

  function makeAssignments(row: IEntity = {}, params: unknown[] = [], glue = ' = '): string[] {
    const assignments: string[] = [];
    Object.entries(row).forEach(([ field, value ]) => {
      params.push(value);
      assignments.push(wrap(field) + glue + ph(params));
    });
    return assignments;
  }

  const repo = (nameIn: string) => {
    const name = wrap(nameIn);
    const repoDesc = `repo(${name})`;
    log.debug('NEW', repoDesc);
    
    async function select(where = '', params: unknown[] = [], limit = 0) {
      const text = 'SELECT * FROM ' + name
        + (where ? ' WHERE ' + where : '')
        + (limit ? ' LIMIT ' + limit : '');
      return await query(text, params);
    }
    
    async function selectOne(where = '', params = []) {
      const result = await select(where, params, 1);
      return result && result.rows && result.rows[0] ? result.rows[0] : null;
    }
    
    async function insertOne(row: IEntity = {}) {
      const fields: string[] = [], params: unknown[] = [], phs: string[] = [];
      Object.entries(row).forEach(([ field , value ]) => {
        fields.push(wrap(field));
        params.push(value);
        phs.push(ph(params));
      });
      // param placeholders: $1, $2, etc.
      const text = 'INSERT INTO ' + name + ' (' + fields.join(', ') + ') '
        + 'VALUES (' + phs.join(', ') + ') '
        + 'RETURNING *';
      return await query(text, params);
    }
    
    async function updateOne(filters: IEntity = {}, row: IEntity = {}) {
      const params: unknown[] = [];
      const assigns   = makeAssignments(row, params);
      const assignStr = assigns.join(', ');
      const whereStr  = makeWhereClause(filters, params);
      const text      = `UPDATE ${name} SET ${assignStr} ${whereStr}`;
      return await query(text, params);
    }
    
    async function deleteOne(filters: IEntity = {}) {
      const params: unknown[] = [];
      const whereStr = makeWhereClause(filters, params);
      const text     = `DELETE FROM ${name} ${whereStr}`;
      return await query(text, params);
    }
    
    return {
      findOne: async (filters: IEntity = {}) => {
        const params: unknown[] = [];
        const where    = makeWhere(filters, params);
        const whereStr = where.length ? where.join(' AND ') : '';
        const row = await selectOne(whereStr, params);
        log.debug(`${repoDesc}.findOne`, { row, params });
        return row;
      },
      listAll: async (filters: IEntity = {}) => {
        const params: unknown[] = [];
        const where    = makeWhere(filters, params);
        const whereStr = where ? where.join(' AND ') : '';
        const { rows, rowCount } = await select(whereStr, params);// TODO: use options
        log.debug(`${repoDesc}.listAll`, { rowCount });
        return rows;
      },
      insertOne: async (row: IEntity = {}) => {
        const { rowCount } = await insertOne(row);
        log.debug(`${repoDesc}.insertOne`, { row, rowCount });
        return 1 === rowCount;
      },
      updateOne: async (id: string, newRow: IEntity = {}) => {
        const { rowCount } = await updateOne({ id }, newRow);
        log.debug(`${repoDesc}.updateOne`, { id, newRow, rowCount });
        return 1 === rowCount;
      },
      deleteOne: async (id: string) => {
        const { rowCount } = await deleteOne({ id });
        log.debug(`${repoDesc}.deleteOne`, { id, rowCount });
        return 1 === rowCount;
      },
    };
  }

  // we have single table
  const moquerRepo = repo('moquer'); // { id, value }

  async function keys(): Promise<string[]> {
    const rows = await moquerRepo.listAll();
    return rows.map(({ id }) => id);
  }

  async function create(kind: string, id: string, data: IEntity): Promise<boolean> {
    return moquerRepo.insertOne({ id: dbKey(kind, id), value: data });
  }

  async function retrieve<T = unknown>(kind: string, id: string): Promise<T> {
    const row = await moquerRepo.findOne({ id: dbKey(kind, id) });
    if (row) return row.value as T;
    throw new Error('record not found: ' + kind + ' ' + id);
  }

  async function update(kind: string, id: string, newValue: IEntity): Promise<boolean> {
    const oldValue = await retrieve(kind, id);
    const value = (oldValue instanceof Object) ? { ...oldValue, ...newValue } : newValue;
    return moquerRepo.updateOne(dbKey(kind, id), { value });
  }

  async function delete_(kind: string, id: string): Promise<boolean> {
    return moquerRepo.deleteOne(dbKey(kind, id));
  }

  return {
    keys,
    create,
    retrieve,
    update,
    delete_,
  }
}
