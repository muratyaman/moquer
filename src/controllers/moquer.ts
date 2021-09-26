import { Request, Response } from 'express';
import { compile } from 'handlebars';
import { KIND_MOQUER } from '../constants';
import { IConfig, IControllerMoquer, IDatabase, IService } from '../types';

export function makeMoquerController(
  conf: IConfig,
  db: IDatabase,
  service: IService,
  log = console,
): IControllerMoquer {

  async function handle(req: Request, res: Response) {
    let resStatus = 200, resHeaders = {}, resBody = null;
    
    const $data = await service.loadAll();
    const rows = await service.findEntities(KIND_MOQUER);

    rows.sort((a, b) => {
      if (a.priority < b.priority) return -1;
      if (a.priority > b.priority) return 1;
      return 0;
    });

    let rowFound = null;

    for (let row of rows) {
      let matchRequired = 0, matchCount = 0, re: RegExp;

      if (row.request_method_regex) {
        matchRequired++;
        re = new RegExp(row.request_method_regex, 'i');
        if (re.test(req.method)) matchCount++;
      }

      if (row.request_path_regex) {
        matchRequired++;
        re = new RegExp(row.request_path_regex, 'i');
        if (re.test(req.path)) matchCount++;
      }

      if (matchRequired === matchCount) {
        rowFound = row;
        break;
      }
    }

    // use row found/matched
    if (rowFound) {
      log.info('row found', rowFound);
      log.info('$data', $data);
      if (rowFound.response_status) resStatus = rowFound.response_status;   
      if (rowFound.response_headers) {
        const templateHeaders = compile(rowFound.response_headers);
        resHeaders = templateHeaders({ $data, '$req': req });
      }
      if (rowFound.response_body) {
        const templateBody = compile(rowFound.response_body);
        resBody = templateBody({ $data, '$req': req });
        //try {
        //  resBody = JSON.parse(resBody);
        //} catch (jsonErr) {
        //  log.warn('JSON error in response body', jsonErr.message);
        //}
      }
    }

    // send response
    Object.entries(resHeaders).forEach(([hk, hv]) => {
      res.setHeader(hk, String(hv));
    });
    if (resStatus) res.status(resStatus);
    //res.json(resBody);
    res.send(resBody);
  }

  return {
    handle,
  };
}
