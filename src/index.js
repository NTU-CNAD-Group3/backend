import 'express-async-errors';

import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import promClient from 'prom-client'; 

import config from '#src/config.js';
import { databaseConnection } from '#src/models/db.js';
import logger from '#src/utils/logger.js';
import routes from '#src/routes/index.js';

const app = express();

app.set('trust proxy', 1);

app.use(compression());
app.use(express.urlencoded({ extended: true, limit: '200mb' }));
app.use(express.json({ limit: '200mb' }));
app.use(
  cors({
    origin: config.API_GATEWAY_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  }),
);

app.use(hpp());
app.use(helmet());

// Prometheus metrics setup
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics();

const httpRequestCounter = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});
// metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', promClient.register.contentType);
    const metrics = await promClient.register.metrics();
    res.end(metrics);
  } catch (ex) {
    res.status(500).end(ex);
  }
});

// log incoming requests
app.use((req, res, next) => {
  res.on('finish', () => {
    const route = req.route ? req.route.path : '';
    if (res.statusCode < 400) {
      logger.info({
        message: `msg=Received response method=${req.method} path=${route} ip=${req.ip} status=${res.statusCode} url=${req.originalUrl}`,
      });
    }
    httpRequestCounter.inc({
      method: req.method,
      route: route,
      status_code: res.statusCode,
    });
  });
  next();
});

app.use(`/api`, routes);

// route not found
app.use('*', (req, res, next) => {
  const err = new Error(`Not Found - ${req.method} ${req.originalUrl}`);
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  const errResponse = err?.response?.data?.message || err?.message || 'Internal Server Error';
  const errStatusCode = err?.response?.status || err?.status || 500;
  const errStack = (err?.response?.data?.stack || err?.stack || 'No stack available').replace(/\n/g, ' ');

  res.status(errStatusCode);
  res.json({
    message: errResponse,
    ...(process.env.NODE_ENV === 'development' && { stack: errStack }),
  });
  logger.error({
    message: `msg=Error occurred method=${req.method} path=${req.path} ip=${req.ip} status=${errStatusCode} url=${req.originalUrl} error=${errResponse} stack=${errStack}`,
  });
});

const server = app.listen(config.PORT, async () => {
  await databaseConnection();
  logger.info({
    message: `msg=Server started at port ${config.PORT}`,
  });
});

export { app, server };
