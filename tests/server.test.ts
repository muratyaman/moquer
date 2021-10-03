import express from 'express';
import request from 'supertest';
import { expect } from 'chai';
import { makeConfig } from '../src/config';
import { makeServer, appStarted } from '../src/server';
import { mockConsole, mockEnv } from './mocks';
import { HEADER_CONTENT_TYPE } from '../src/constants';
import { newCustomer, newCustomerModel } from './fixtures/customers';

describe('server', async () => {
  const penv = mockEnv();
  const conf = makeConfig(penv);
  const app  = express();
  const log  = mockConsole();

  it('should make server', async () => {
    const server = await makeServer(conf, app, false, log);
    expect(!!server).to.eq(true);
    expect(server instanceof Object).to.eq(true);
  });

  it('should call back after starting', async () => {
    appStarted(conf, log);
    expect(log.info.called).to.eq(true);
  });

  // admin ***
  it('should respond to request to get models', (done) => {
    request(app)
      .get(conf.http.adminApiBasePath + '/models')
      .expect(HEADER_CONTENT_TYPE, /json/)
      .expect(200, done);
  });

  it('should respond to request to get model moquer', (done) => {
    request(app)
      .get(conf.http.adminApiBasePath + '/models/moquer')
      .expect(HEADER_CONTENT_TYPE, /json/)
      .expect(200, done);
  });

  it('should respond to request to create model customer', (done) => {
    request(app)
      .post(conf.http.adminApiBasePath + '/models/customer')
      .send(newCustomerModel())
      .expect(HEADER_CONTENT_TYPE, /json/)
      .expect(200, done);
  });

  it('should respond to request to get entities', (done) => {
    request(app)
      .get(conf.http.adminApiBasePath + '/entities')
      .expect(HEADER_CONTENT_TYPE, /json/)
      .expect(200, done);
  });

  it('should respond to request to create entity customer', (done) => {
    request(app)
      .post(conf.http.adminApiBasePath + '/entities/customer/john')
      .send(newCustomer())
      .expect(HEADER_CONTENT_TYPE, /json/)
      .expect(200, done);
  });

  it('should respond to request to delete entity customer', (done) => {
    request(app)
      .delete(conf.http.adminApiBasePath + '/entities/customer/john')
      .expect(HEADER_CONTENT_TYPE, /json/)
      .expect(200, done);
  });

  it('should respond to request to delete model customer', (done) => {
    request(app)
      .delete(conf.http.adminApiBasePath + '/models/customer')
      .expect(HEADER_CONTENT_TYPE, /json/)
      .expect(200, done);
  });

  it('should respond to request to get entity user haci', (done) => {
    request(app)
      .get(conf.http.adminApiBasePath + '/entities/user/haci')
      .expect(HEADER_CONTENT_TYPE, /json/)
      .expect(200, done);
  });

  // mocking ***
  it('should respond to request to get user haci for MOCKING', (done) => {
    request(app)
      .get(conf.http.mockApiBasePath + 'user/haci')
      .expect(HEADER_CONTENT_TYPE, /json/)
      .expect(200, done);
  });

});
