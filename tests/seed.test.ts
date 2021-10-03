import { expect } from 'chai';
import { makeConfig } from '../src/config';
import { makeDb } from '../src/db';
import { seed } from '../src/seed';
import { mockConsole, mockEnv } from './mocks';

describe('seed', () => {
  it('should find json files, read them and import data', async () => {
    const penv   = mockEnv();
    const conf   = makeConfig(penv);
    const log    = mockConsole();
    const db     = makeDb(conf);
    //const finder = async () => ['data.json'];
    //const reader = async () => ({});
    const out    = await seed(conf, db, log);//, finder, reader);
    expect(out).to.eq(true);
  });
});
