
import { IConfig, IDatabase, IEntity } from './types';
import { dbKeySplit, findFiles, readJsonFile } from './utils';

export async function seed(conf: IConfig, db: IDatabase, log = console, finder = findFiles, reader = readJsonFile): Promise<boolean> {
  const pattern = conf.db.seedFilesDir + '/*.json';
  log.info('seed started:', pattern);
  const files = await finder(pattern);
  for (let file of files) {
    const data = await reader(file);
    log.info('- importing file', file, '...');
    try {
      await importData(db, data, log);
      log.info('- importing file', file, '... done!');
    } catch (err) {
      log.info('- importing file', file, '... ERROR!', err.message);
    }
  }
  log.info('seed finished!');
  return true;
}

export async function importData(db: IDatabase, data: any, log = console): Promise<boolean> {
  const kvList = Object.entries(data);
  for (let [key, value] of kvList) {
    const { kind, id } = dbKeySplit(key);
    log.info('-- importing row', kind, id, '...');
    try {
      const out = await db.create(kind, id, value as IEntity);
      log.info('-- importing row', kind, id, '... done!', out);
    } catch (err) {
      log.info('-- importing row', kind, id, '... ERROR!', err.message);
    }
  }
  return true;
}
