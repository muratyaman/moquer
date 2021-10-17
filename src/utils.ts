import { Request } from 'express';
import glob from 'glob-promise';
import jsonfile from 'jsonfile';
import { IKindWithId } from './types';

export function dbKey(kind: string, id: string): string {
  return `${kind}:${id}`;
}

export function dbKeySplit(key: string): IKindWithId {
  const [ kind, id ] = key.split(':');
  return { kind, id };
}

export async function findFiles(pattern = '*.json', log = console): Promise<string[]> {
  try {
    const files = await glob.promise(pattern);
    return files;
  } catch (err) {
    log.error(err);
  }
  return [];
}

export async function readJsonFile(file: string, log = console): Promise<unknown> {
  try {
    const data = await jsonfile.readFile(file);
    return data;
  } catch (err) {
    log.error(err);
    return null;
  }
}

export function prettyJson(val: any) {
  return JSON.stringify(val, null, '  ');
}

export function adaptRequestForTemplate(req: Request) {
  const reqHeaders = {};
  Object.entries(req.headers).forEach(([k, v]) => {
    const k2 = k.toLowerCase().replace(/[^a-z0-9]/g, '');
    reqHeaders[k2] = req.header(k);
  });
  console.log('request headers', reqHeaders);
  return {
    method: req.method,
    path: req.path,
    query: req.query,
    headers: reqHeaders,
    body: req.body,
  };
}
