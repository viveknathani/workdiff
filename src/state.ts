import { getCacheConnection } from './cache';
import config from './config';
import { AppState } from './types';

export const state: AppState = {
  cache: getCacheConnection(config.REDIS_URL),
};
