import winston from 'winston';
import expressWinston from 'express-winston';
import express from 'express';
import cors from 'cors';
import config from './config';
import { router } from './routes';
import * as path from 'path';
import { HTTP_CODE, SERVER_ENVIRONMENT } from './types';
import { createBullDashboardAndAttachRouter } from './queues/dashboard';
import { getOperationalSet, sendStandardResponse } from './utils';
import {
  addToGetCommitsQueue,
  queue as getCommitsQueue,
} from './queues/workers/getCommits';

async function bootstrap(app: express.Application) {
  const operationalSet = await getOperationalSet(
    __dirname + '/data/input.jsonl',
  );

  // Clean any delayed/waiting tasks
  await getCommitsQueue.drain(true);

  // Schedule new tasks
  for (const operation of operationalSet.data) {
    await addToGetCommitsQueue(operation, {
      repeat: {
        pattern: operation.interval,
      },
      jobId: `${operation.owner}/${operation.repo}/${operation.branch}`,
    });
  }

  app.get('/', async (req: any, res: any) => {
    try {
      return sendStandardResponse(
        HTTP_CODE.OK,
        {
          status: 'success',
          data: operationalSet.data,
        },
        res,
      );
    } catch (err) {
      return sendStandardResponse(
        HTTP_CODE.SERVER_ERROR,
        {
          status: 'error',
        },
        res,
      );
    }
  });
}

async function main() {
  const requestLogger = expressWinston.logger({
    format: winston.format.json(),
    transports: [new winston.transports.Console()],
    meta: true,
    expressFormat: true,
  });
  const app = express();
  if (config.ENVIRONMENT !== SERVER_ENVIRONMENT.DEV) {
    app.set('trust proxy', true);
  }
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);
  createBullDashboardAndAttachRouter(app);
  app.use(cors());
  app.use('/web', express.static(path.join(__dirname, './web')));
  app.use('/api/v1', router);
  app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send('User-agent: *\nDisallow: /admin/');
  });

  await bootstrap(app);

  app.listen(config.PORT, () => {
    console.log(
      `💨 server is running at: ${config.HOST}:${config.PORT}, environment is ${config.ENVIRONMENT}`,
    );
  });
}

main();
