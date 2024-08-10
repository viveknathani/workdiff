import { ApiResponse, HTTP_CODE } from '../types';
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

export { sendStandardResponse, snakeCaseToCamelCaseObject };
