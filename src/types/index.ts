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

export {
  ApiResponse,
  AppState,
  HealthCheckResponse,
  HTTP_CODE,
  SERVER_ENVIRONMENT,
  QUEUE_NAME,
};
