import {
  initTracer,
  TracingOptions,
  TracingConfig,
  JaegerTracer,
} from 'jaeger-client';

export function createTracer(serviceName: string): JaegerTracer {
  const config: TracingConfig = {
    serviceName,
    sampler: {
      type: 'const',
      param: 1,
    },
    reporter: {
      logSpans: true,
    },
  };
  const options: TracingOptions = {
    logger: {
      info(msg) {
        console.log('INFO ', msg);
      },
      error(msg) {
        console.log('ERROR', msg);
      },
    },
  };
  return initTracer(config, options);
}
