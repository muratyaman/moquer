import express, { Application, Request, Response } from 'express';
import { KIND_MOQUER } from '../constants';
import { makeMoquerController } from '../controllers/moquer';
import { IConfig, IDatabase, IService } from '../types';

export function makeMockRouters(
  conf: IConfig,
  app: Application,
  db: IDatabase,
  service: IService,
  mockRouter = express.Router(),
  log = console,
) {

  const moquerController = makeMoquerController(conf, db, service, log);
  mockRouter.use(moquerController.handle);

  return { mockRouter };
}
