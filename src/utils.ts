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
