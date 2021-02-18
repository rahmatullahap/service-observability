/** @module todoService */

import * as url from 'url';
import {
  add,
  remove,
  done,
  undone,
  list,
  ERROR_ADD_DATA_INVALID,
  ERROR_TODO_NOT_FOUND,
} from './todo';
import { IncomingMessage, ServerResponse } from 'http';
import { AppContext } from './lib/context';
import { FORMAT_HTTP_HEADERS } from 'opentracing';

/**
 * service to get list of todos
 * @param req
 * @param res
 */
export async function listSvc(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  try {
    const todos = await list();
    res.setHeader('content-type', 'application/json');
    res.write(JSON.stringify(todos));
    res.end();
  } catch (err) {
    res.statusCode = 500;
    res.write(JSON.stringify(err.message || err));
    res.end();
    return;
  }
}

/**
 * service to add a new todo
 * @param req
 * @param res
 */
export async function addSvc(
  req: IncomingMessage,
  res: ServerResponse,
  ctx: AppContext
): Promise<void> {
  let data = '';
  req.on('data', (chunk) => {
    data += chunk;
  });
  req.on('end', async () => {
    const httpSpan = ctx.tracer.extract(FORMAT_HTTP_HEADERS, req.headers);
    const parentSpan = ctx.tracer.startSpan('post_add', {
      childOf: httpSpan,
    });

    const span = ctx.tracer.startSpan('parsing_task', { childOf: parentSpan });
    const body = JSON.parse(data); // 'Buy the milk'
    if (!body.task) {
      span.setTag('error', true);
      span.log({
        event: 'error get task',
        message: 'parameter tidak lengkap',
      });
      res.statusCode = 400;
      res.write(ERROR_ADD_DATA_INVALID);
      res.end();
      span.finish();
      parentSpan.finish();
      return;
    }
    const span2 = ctx.tracer.startSpan('write_task_on_db', {
      childOf: parentSpan,
    });
    const span3 = ctx.tracer.startSpan('encode_result', {
      childOf: parentSpan,
    });
    try {
      const todo = await add(body);
      span2.finish();
      res.setHeader('content-type', 'application/json');
      res.statusCode = 200;
      res.write(JSON.stringify(todo));
      res.end();
      span3.finish();
    } catch (err) {
      span2.setTag('error', true);
      span2.log({
        event: 'error add task',
        message: err.message,
      });
      span2.finish();
      ctx.logger.error(err.message);
      res.statusCode = 500;
      res.write(JSON.stringify(err.message || err));
      res.end();
      span3.finish();
      parentSpan.finish();
      return;
    }
    parentSpan.finish();
  });
}

/**
 * service to remove a todo by it's id
 * @param req
 * @param res
 */
export async function removeSvc(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  const uri = url.parse(req.url, true);
  const id = uri.query['id'] as string;
  if (!id) {
    res.statusCode = 401;
    res.write('parameter id tidak ditemukan');
    res.end();
    return;
  }
  try {
    const todo = await remove(parseInt(id, 10));
    res.setHeader('content-type', 'application/json');
    res.statusCode = 200;
    res.write(JSON.stringify(todo));
    res.end();
  } catch (err) {
    if (err === ERROR_TODO_NOT_FOUND) {
      res.statusCode = 404;
      res.write(err);
      res.end();
      return;
    }
    res.statusCode = 500;
    res.write(JSON.stringify(err.message || err));
    res.end();
    return;
  }
}

/**
 * service to set a todo to done by it's id
 * @param req
 * @param res
 */
export async function doneSvc(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  const uri = url.parse(req.url, true);
  const id = <string>uri.query['id'];
  if (!id) {
    res.statusCode = 401;
    res.write('parameter id tidak ditemukan');
    res.end();
    return;
  }
  try {
    const todo = await done(parseInt(id, 10));
    res.setHeader('content-type', 'application/json');
    res.statusCode = 200;
    res.write(JSON.stringify(todo));
    res.end();
  } catch (err) {
    if (err === ERROR_TODO_NOT_FOUND) {
      res.statusCode = 404;
      res.write(err);
      res.end();
      return;
    }
    res.statusCode = 500;
    console.log(err);
    res.write(JSON.stringify(err.message || err));
    res.end();
    return;
  }
}

/**
 * service to set a todo to undone by it's id
 * @param req
 * @param res
 */
export async function undoneSvc(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  const uri = url.parse(req.url, true);
  const id = uri.query['id'] as string;
  if (!id) {
    res.statusCode = 401;
    res.write('parameter id tidak ditemukan');
    res.end();
    return;
  }
  try {
    const todo = await undone(parseInt(id, 10));
    res.setHeader('content-type', 'application/json');
    res.statusCode = 200;
    res.write(JSON.stringify(todo));
    res.end();
  } catch (err) {
    if (err === ERROR_TODO_NOT_FOUND) {
      res.statusCode = 404;
      res.write(err);
      res.end();
      return;
    }
    res.statusCode = 500;
    res.write(JSON.stringify(err.message || err));
    res.end();
    return;
  }
}
