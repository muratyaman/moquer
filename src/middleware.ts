import express, { Application, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { IConfig } from './types';

export function attachMiddlewareFirst(conf: IConfig, app: Application, log = console): void {
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(makeLogger(log));
  app.use(makeErrorHandler(log));
}

export function attachMiddlewareLast(conf: IConfig, app: Application, log = console): void {
  app.use(makeNotFound(log));
}

export function makeLogger(log = console) {
  function logger(req: Request, res: Response, next: NextFunction) {
    log.info(new Date(), req.method, req.path);
    next();
  }
  return logger;
}

export function makeNotFound(log = console) {
  function notFound(req: Request, res: Response, next: NextFunction) {
    log.warn(new Date(), req.method, req.path, 'NOT FOUND');
    res.status(404).json({ error: 'not found' });
  }
  return notFound;
}

export function makeErrorHandler(log = console) {
  function error(err: Error, req: Request, res: Response, next: NextFunction) {
    log.error(new Date(), req.method, req.path, 'details below');
    log.error(err.stack);
    if (res.headersSent) return next(err);
    res.status(500).json({ error: 'unexpected server error' });
  }
  return error;
}
