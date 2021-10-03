
import { IConfig, IDatabase } from './types';
import { dbKeySplit, findFiles, readJsonFile } from './utils';

export async function seed(conf: IConfig, db: IDatabase, log = console, finder = findFiles, reader = readJsonFile): Promise<boolean> {
  const pattern = conf.db.seedFilesDir + '/*.json';
  log.info('seed started:', pattern);
  const files = await finder(pattern);
  for (let file of files) {
    const data = await reader(file);
    log.info('- importing file', file, '...');
    await importData(db, data, log);
    log.info('- importing file', file, '... done!');
  }
  log.info('seed finished!');
  return true;
}

export async function importData(db: IDatabase, data: any, log = console): Promise<boolean> {
  const kvList = Object.entries(data);
  for (let [key, value] of kvList) {
    const { kind, id } = dbKeySplit(key);
    log.info('-- importing row', kind, id, '...');
    const out = await db.create(kind, id, value);
    log.info('-- importing row', kind, id, '... done!', out);
  }
  return true;
}
