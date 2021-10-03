import { Request, Response } from 'express';
import { Schema, ValidatorResult } from 'jsonschema';

export interface IProcessEnv extends Record<string, string | undefined> {
  MOQUER_HTTP_PORT?: string;
  MOQUER_ADMIN_API_BASE_PATH?: string;
  MOQUER_MOCK_API_BASE_PATH?: string;
  MOQUER_STATIC_BASE_PATH?: string;
  MOQUER_STATIC_DIR?: string;
  MOQUER_DB_KIND?: string;
  MOQUER_DB_SEED?: string;
}

export interface IConfigHttp {
  port: number;
  adminApiBasePath: string;
  mockApiBasePath: string;
  staticBasePath: string;
  staticFilesDir: string;
}

export interface IConfigApp {
  name: string;
  version: string;
}

export interface IConfigDb {
  kind: string;
  seedFilesDir: string;
  seed: boolean;
}

export interface IConfig {
  app: IConfigApp;
  http: IConfigHttp;
  db: IConfigDb;
}

export interface IDatabase {
  keys(): Promise<string[]>;
  create(kind: string, id: string, data: any): Promise<boolean>;
  retrieve(kind: string, id: string): Promise<any>;
  update(kind: string, id: string, newData: any): Promise<boolean>;
  delete_(kind: string, id: string): Promise<boolean>;
}

export interface IController {
  create(req: Request, res: Response): Promise<void>;
  retrieve(req: Request, res: Response): Promise<void>;
  update(req: Request, res: Response): Promise<void>;
  delete_(req: Request, res: Response): Promise<void>;
  search(req: Request, res: Response): Promise<void>;
}

export interface IControllerMoquer {
  handle(req: Request, res: Response): Promise<void>;
}

export type IModel = Schema; // JSON schema

export type IEntity = Record<string, any>;

export type IRecords = Record<string, IEntity>;

export interface IMoquer {
  priority: number;
  request_method_regex: string; // e.g. "get",
  request_path_regex: string;   // e.g. "^\/users\/haci$",
  request_headers_regex: string;
  request_body_regex: string;
  request_query_regex: string;
  response_status: number; // e.g. 200
  response_headers: string; // e.g. "{ \"x-correlation\": \"{{request.headers['x-correlation']}}\" }",
  response_body: string; // e.g. "{{db.user.haci}}"
}

export interface IService {
  loadAll(): Promise<IRecords>;
  findModel(kind: string): Promise<IModel>;
  findEntity<T = any>(kind: string, id: string): Promise<T>;
  findEntities<T = any>(kind: string): Promise<T[]>;
  validate(kind: string, value: any): Promise<ValidatorResult>;
}

export interface IKindWithId {
  kind: string;
  id: string;
}
