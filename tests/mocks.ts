import sinon from 'sinon';

export const mockConsole = () => ({
  ...console,
  log: sinon.stub(),
  info: sinon.stub(),
  warn: sinon.stub(),
  error: sinon.stub(),
});

export const mockEnv = (penv = process.env, overrides = {}) => ({
  ...process.env, 
  MOQUER_HTTP_PORT: '9090',
  MOQUER_ADMIN_API_BASE_PATH: '/moquer',
  MOQUER_MOCK_API_BASE_PATH: '/',
  MOQUER_STATIC_BASE_PATH: '/',
  MOQUER_STATIC_DIR: './static',
  MOQUER_DB_KIND: 'cache',
  MOQUER_DB_SEED: '1',
  MOQUER_DB_SEED_DIR: './seeds',
  ...overrides,
});
