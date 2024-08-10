import { Job, JobsOptions } from 'bullmq';
import { GetCommitsJobData, QUEUE_NAME } from '../../types';
import { createQueue, createWorker } from '../factory';
import { GetCommitsService } from '../../services/GetCommitsService';
import { state } from '../../state';

const queueName = QUEUE_NAME.GET_COMMITS;

const queue = createQueue(queueName);

const worker = createWorker(queueName, async (job: Job) => {
  const data = job.data as GetCommitsJobData;
  const getCommitsService = GetCommitsService.getInstance(state);
  const commits = await getCommitsService.fromInput(data);
  console.log(commits);
  return;
});

const addToGetCommitsQueue = (
  data: GetCommitsJobData,
  options?: JobsOptions | undefined,
) => {
  const jobName = `${queueName}`;
  return queue.add(jobName, data, options);
};

export { queue, worker, addToGetCommitsQueue };
