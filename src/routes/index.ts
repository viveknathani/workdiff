import express from 'express';
import { healthCheckRouter } from './health';

const router: express.Router = express.Router();

router.use('/', healthCheckRouter);

export { router };
