import jsonfile from 'jsonfile';
import glob from 'glob-promise';
import { IConfig, IDatabase } from './types';
import { dbKeySplit } from './utils';

export async function seed(conf: IConfig, db: IDatabase, log = console): Promise<void> {
  const pattern = conf.db.seedFilesDir + '/*.json';
  log.info('seed started:', pattern);
  const files = await glob.promise(pattern);
  for (let file of files) {
    const data = await jsonfile.readFile(file);
    log.info('- importing file', file, '...');
    await importData(db, data);
    log.info('- importing file', file, '... done!');
  }
  log.info('seed finished!');
}

export async function importData(db: IDatabase, data: any, log = console) {
  const kvList = Object.entries(data);
  for (let [key, value] of kvList) {
    const { kind, id } = dbKeySplit(key);
    log.info('-- importing row', kind, id, '...');
    const out = await db.create(kind, id, value);
    log.info('-- importing row', kind, id, '... done!');
  }
}
