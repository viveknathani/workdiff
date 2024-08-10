import { ApiResponse, HTTP_CODE, SINCE } from '../types';
import express from 'express';

const sendStandardResponse = (
  statusCode: HTTP_CODE,
  response: ApiResponse,
  res: express.Response,
) => {
  res.status(statusCode).send(response);
};

const snakeCaseToCamelCaseString = (input: string): string => {
  return input
    .split('_')
    .map((word, index) => {
      if (index !== 0) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    })
    .join('');
};

const snakeCaseToCamelCaseObject = (input: any) => {
  if (input === undefined || input === null) {
    return input;
  }
  const out: any = {};
  Object.keys(input).forEach((key) => {
    out[snakeCaseToCamelCaseString(key)] = input[key];
  });
  return out;
};

const getSinceTimestamp = (since: SINCE): string => {
  const now = new Date();
  let result = new Date();
  switch (since) {
    case SINCE.LAST_DAY:
      result = new Date(now.setDate(now.getDate() - 1));
      break;
    case SINCE.LAST_WEEK:
      result = new Date(now.setDate(now.getDate() - 7));
      break;
    case SINCE.LAST_MONTH:
      result = new Date(now.setMonth(now.getMonth() - 1));
      break;
    default:
      throw new Error('invalid since type');
  }
  return result.toISOString();
};

export { sendStandardResponse, snakeCaseToCamelCaseObject, getSinceTimestamp };
