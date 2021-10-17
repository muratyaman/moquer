import path from 'path';
import { IConfig, IProcessEnv } from './types';

export function makeConfig(penv: IProcessEnv = process.env): IConfig {

  let seedFilesDir = path.resolve(__dirname, '..', 'seed');
  if (penv.MOQUER_DB_SEED_DIR) seedFilesDir = path.resolve(penv.MOQUER_DB_SEED_DIR);

  let staticFilesDir = path.resolve(__dirname, '..', 'static');
  if (penv.MOQUER_MOCK_STATIC_DIR) seedFilesDir = path.resolve(penv.MOQUER_MOCK_STATIC_DIR);

  return {
    penv,
    app: {
      name: 'moquer',
      version: penv.npm_package_version,
    },
    http: {
      port: Number.parseInt(penv.MOQUER_HTTP_PORT ?? '0'),
      adminApiBasePath: penv.MOQUER_ADMIN_API_BASE_PATH ?? '/moquer',
      mockApiBasePath: penv.MOQUER_MOCK_API_BASE_PATH ?? '/',
      staticBasePath: penv.MOQUER_STATIC_BASE_PATH ?? '/',
      staticFilesDir,
    },
    db: {
      kind: penv.MOQUER_DB_KIND ?? 'cache',
      seedFilesDir,
      seed: Number.parseInt(penv.MOQUER_DB_SEED ?? '0') > 0,
    },
  };
}
