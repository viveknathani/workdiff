import { Job, JobsOptions } from 'bullmq';
import { createQueue, createWorker } from '../factory';
import { getSlackBlocks } from '../../utils';
import axios from 'axios';
import { PostToSlackJobData, QUEUE_NAME } from '../../types';

const queueName = QUEUE_NAME.POST_TO_SLACK;

const queue = createQueue(queueName);

const worker = createWorker(queueName, async (job: Job) => {
  const data = job.data as PostToSlackJobData;
  const blocks = getSlackBlocks(
    data.owner,
    data.repo,
    data.since,
    data.commits,
  );
  await axios.post(
    `${process.env[`${data.slackUrlKey}`]}`,
    {
      blocks,
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
  return;
});

const addToPostToSlackQueue = (
  data: PostToSlackJobData,
  options?: JobsOptions | undefined,
) => {
  const jobName = `${queueName}`;
  return queue.add(jobName, data, options);
};

export { queue, worker, addToPostToSlackQueue };
