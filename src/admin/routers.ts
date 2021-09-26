import express, { Application } from 'express';
import { makeEntityController, makeModelController } from '../controllers';
import { IConfig, IDatabase, IService } from '../types';

export function makeAdminRouters(
  conf: IConfig,
  app: Application,
  db: IDatabase,
  service: IService,
  adminRouter  = express.Router(),
  entityRouter = express.Router(),
  modelRouter  = express.Router(),
  log = console,
) {

  const modelController  = makeModelController(conf, db, service, log);
  const entityController = makeEntityController(conf, db, service, log);

  modelRouter.post  ('/:kind', modelController.create);
  modelRouter.get   ('/:kind', modelController.retrieve);
  modelRouter.patch ('/:kind', modelController.update);
  modelRouter.delete('/:kind', modelController.delete_);
  modelRouter.get   ('/',      modelController.search);

  entityRouter.post  ('/:kind/:id', entityController.create);
  entityRouter.get   ('/:kind/:id', entityController.retrieve);
  entityRouter.patch ('/:kind/:id', entityController.update);
  entityRouter.delete('/:kind/:id', entityController.delete_);
  entityRouter.get   ('/',          entityController.search);

  adminRouter.use('/models', modelRouter);
  adminRouter.use('/entities', entityRouter);

  return { adminRouter, modelRouter, entityRouter };
}
