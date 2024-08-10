import { Redis } from 'ioredis';

enum HTTP_CODE {
  OK = 200,
  CREATED = 201,
  CLIENT_ERROR = 400,
  UNAUTHORIZED = 401,
  SERVER_ERROR = 500,
}

enum SERVER_ENVIRONMENT {
  DEV = 'dev',
  PROD = 'prod',
}

enum QUEUE_NAME {
  GET_COMMITS = 'GET_COMMITS',
  POST_TO_SLACK = 'POST_TO_SLACK',
}

enum SINCE {
  LAST_DAY = 'LAST_DAY',
  LAST_WEEK = 'LAST_WEEK',
  LAST_MONTH = 'LAST_MONTH',
}

interface ApiResponse {
  status: 'success' | 'error';
  data?: any;
  message?: string;
}

interface AppState {
  cache: Redis;
}

interface HealthCheckResponse {
  allGood: boolean;
  canConnectToCache: boolean;
}

interface Commit {
  message: string;
  url: string;
  committer: {
    name: string;
    url: string;
  };
}

interface OperationalSetInput {
  owner: string;
  repo: string;
  branch: string;
  interval: string;
  since: SINCE;
  slackUrlKey: string;
}

interface GetCommitsJobData extends OperationalSetInput {}

interface PostToSlackJobData {
  slackUrlKey: string;
  owner: string;
  repo: string;
  since: SINCE;
  commits: Commit[];
}

export {
  ApiResponse,
  AppState,
  Commit,
  HealthCheckResponse,
  OperationalSetInput,
  GetCommitsJobData,
  PostToSlackJobData,
  HTTP_CODE,
  SERVER_ENVIRONMENT,
  QUEUE_NAME,
  SINCE,
};
