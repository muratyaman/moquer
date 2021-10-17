import { Request, Response } from 'express';
import Handlebars, { compile, SafeString } from 'handlebars';
import { KIND_MOQUER } from '../constants';
import { IConfig, IControllerMoquer, IDatabase, IMakeString, IService } from '../types';
import { adaptRequestForTemplate } from '../utils';

Handlebars.registerHelper('upper', val => {
  return new SafeString(val.toUpperCase());
});

Handlebars.registerHelper('lower', val => {
  return new SafeString(val.toLowerCase());
});

Handlebars.registerHelper('int', val => {
  return new SafeString(String(Number.parseInt(val)));
});

Handlebars.registerHelper('json', val => {
  return new SafeString(JSON.stringify(val));
});

export function makeMoquerController(
  conf: IConfig,
  db: IDatabase,
  service: IService,
  log = console,
): IControllerMoquer {

  async function handle(req: Request, res: Response) {
    let resStatus = 200, resHeaders = '', resBody = null;

    const $req  = adaptRequestForTemplate(req);
    const $data = await service.loadAll();
    const rows  = await service.findEntities(KIND_MOQUER); // settings for mocking

    rows.sort((a, b) => {
      if (a.priority < b.priority) return -1;
      if (a.priority > b.priority) return 1;
      return 0;
    });

    const filteredRows = rows.filter(row => {
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

      if (row.request_query_regex) {
        matchRequired++;
        re = new RegExp(row.request_query_regex, 'i');
        if (re.test(JSON.stringify(req.query))) matchCount++;
      }

      if (row.request_headers_regex) {
        matchRequired++;
        re = new RegExp(row.request_headers_regex, 'i');
        if (re.test(JSON.stringify(req.headers))) matchCount++;
      }

      if (row.request_body_regex) {
        matchRequired++;
        re = new RegExp(row.request_body_regex, 'i');
        if (re.test(JSON.stringify(req.body))) matchCount++;
      }

      return (0 < matchRequired) && (matchRequired === matchCount);
    });

    const rowFound = filteredRows.length ? filteredRows[0] : null;

    if (1 < filteredRows.length) {
      log.warn('found more than 1 matching mock, selecting first one to send');
    }

    // use row found/matched
    let resBodyJson = null;
    if (rowFound) {
      log.info('row found', rowFound);
      log.info('$data', $data);
      if (rowFound.response_status) resStatus = rowFound.response_status;   
      if (rowFound.response_headers) {
        const templateHeaders = compile(rowFound.response_headers);
        resHeaders = templateHeaders({ $data, $req });
      }
      if (rowFound.response_body) {
        const templateBody = compile(rowFound.response_body);
        resBody = templateBody({ $data, $req });
        try {
          resBodyJson = JSON.parse(resBody);
        } catch (jsonErr) {
          log.warn('JSON error', jsonErr.message);
          log.warn('... in response body', jsonErr.message);
        }
      }
    }

    // send response
    let resHeadersJson = null;
    try {
      if (resHeaders) resHeadersJson = JSON.parse(resHeaders);
    } catch (jsonErr2) {
      log.warn('JSON error', jsonErr2.message);
      log.warn('... in response headers', resHeaders);
    }
    if (resHeadersJson) {
      Object.entries(resHeadersJson).forEach(([hk, hv]) => { res.setHeader(hk, String(hv)); });
    }
    if (resStatus) res.status(resStatus);
    if (resBodyJson) {
      res.json(resBodyJson);
    } else {
      res.send(resBody);
    }
  }

  return {
    handle,
  };
}
