import { Logger } from 'winston';
import { JaegerTracer } from 'jaeger-client';

export interface AppContext {
  logger: Logger;
  tracer: JaegerTracer;
}
