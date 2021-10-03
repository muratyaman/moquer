import { expect } from 'chai';
import { dbKey, dbKeySplit } from '../src/utils';

describe('utils dbKey', () => {
  it('should return key when given model name and entity id', () => {
    const key = dbKey('modelName', 'entityId');
    expect(key).to.eq('modelName:entityId');
  });
});

describe('utils dbKeySplit', () => {
  it('should return model name and entity id', () => {
    const info = dbKeySplit(dbKey('modelName', 'entityId'));
    expect(!!info).to.eq(true);
    expect(info instanceof Object).to.eq(true);
    expect(info.kind).to.eq('modelName');
    expect(info.id).to.eq('entityId');
  });
});
