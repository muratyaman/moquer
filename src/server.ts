import express, { Application } from 'express';
import { IConfig } from './types';
import { makeMockRouters } from './mock/routers';
import { makeDb } from './db';
import { attachMiddlewareFirst, attachMiddlewareLast } from './middleware';
import { makeAdminRouters } from './admin/routers';
import { seed } from './seed';
import { makeService } from './service';

export async function makeServer(
  conf: IConfig,
  app = express(),
  start = true,
  log = console,
): Promise<Application> {

  log.info('settings');
  log.info(conf);
  const db = makeDb(conf);

  const service = makeService(conf, db, log);

  if (conf.db.seed) {
    await seed(conf, db, log);
  }

  const mockRouter = express.Router();
  makeMockRouters(conf, app, db, service, mockRouter);

  const adminRouter = express.Router();
  makeAdminRouters(conf, app, db, service, adminRouter);

  attachMiddlewareFirst(conf, app, log);

  app.use(conf.http.adminApiBasePath, adminRouter);
  app.use(conf.http.staticBasePath, express.static(conf.http.staticFilesDir));
  app.use(conf.http.mockApiBasePath, mockRouter);

  attachMiddlewareLast(conf, app, log);

  if (start) app.listen(conf.http.port, () => appStarted(conf, log));

  return app;
}

export function appStarted(conf: IConfig, log = console) {
  const host = `http://localhost:${conf.http.port}`;
  log.info(conf.app.name, conf.app.version, 'ready');
  log.info(`- admin API: ${host}${conf.http.adminApiBasePath}`);
  log.info(`- mocking APIs at ${host}${conf.http.mockApiBasePath}`);
  log.info(`- static files: ${host}${conf.http.staticBasePath}`);
}
