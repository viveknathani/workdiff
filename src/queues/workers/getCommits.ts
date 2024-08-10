import { JobsOptions } from 'bullmq';
import { QUEUE_NAME } from '../../types';
import { createQueue, createWorker } from '../factory';

const queueName = QUEUE_NAME.GET_COMMITS;

const queue = createQueue(queueName);

const worker = createWorker(queueName, async () => {});

const addToGetCommitsQueue = (
  data?: any,
  options?: JobsOptions | undefined,
) => {
  const jobName = `${queueName}`;
  return queue.add(jobName, data, options);
};

export { queue, worker, addToGetCommitsQueue };
