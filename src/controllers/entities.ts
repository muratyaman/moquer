import { Request, Response } from 'express';
import { IConfig, IController, IDatabase, IService } from '../types';
import { KIND_MODEL } from '../constants';
import { dbKeySplit } from '../utils';

export function makeEntityController(
  conf: IConfig,
  db: IDatabase,
  service: IService,
  log = console,
): IController {

  async function create(req: Request, res: Response): Promise<void> {
    const { kind, id } = req.params;
    const data = req.body;
    let out = null;
    try {
      out = await db.create(kind, id, data);
    } catch (err) {
      out = { error: err.message };
    }
    res.json(out);
  }

  async function retrieve(req: Request, res: Response): Promise<void> {
    const { kind, id } = req.params;
    let out = null;
    try {
      out = await db.retrieve(kind, id);
    } catch (err) {
      out = { error: err.message };
    }
    res.json(out);
  }

  async function update(req: Request, res: Response): Promise<void> {
    const { kind, id } = req.params;
    const data = req.body;
    let out = null;
    try {
      out = await db.update(kind, id, data);
    } catch (err) {
      out = { error: err.message };
    }
    res.json(out);
  }

  async function delete_(req: Request, res: Response): Promise<void>{
    const { kind, id } = req.params;
    let out = null;
    try {
      out = await db.delete_(kind, id);
    } catch (err) {
      out = { error: err.message };
    }
    res.json(out);
  }

  async function search(req: Request, res: Response): Promise<void> {
    const out = await db.keys();
    const data = out.map(dbKeySplit).filter(k => k.kind !== KIND_MODEL); // exclude models
    res.json(data);
  }
  
  return {
    create,
    retrieve,
    update,
    delete_,
    search,
  };
}
