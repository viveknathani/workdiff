import {
  ApiResponse,
  Commit,
  HTTP_CODE,
  OperationalSet,
  OperationalSetInput,
  SINCE,
} from '../types';
import fs from 'fs';
import readline from 'readline';
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

const getSlackBlocks = (
  owner: string,
  repo: string,
  since: SINCE,
  commits: Commit[],
) => {
  const result: any[] = [];

  const headerBlock = {
    type: 'rich_text',
    elements: [
      {
        type: 'rich_text_section',
        elements: [
          {
            type: 'text',
            text: getHeaderFromSince(since),
            style: {
              bold: true,
            },
          },
        ],
      },
    ],
  };

  const contentBlock = {
    type: 'rich_text',
    elements: [
      {
        type: 'rich_text_section',
        elements: [
          {
            type: 'link',
            url: `https://github.com/${owner}/${repo}`,
            text: `${owner}/${repo}`,
          },
        ],
      },
    ],
  };

  const commitListBlock: any = {
    type: 'rich_text_list',
    style: 'ordered',
    indent: 0,
    border: 0,
    elements: [],
  };

  commits.forEach((commit) => {
    commitListBlock.elements.push({
      type: 'rich_text_section',
      elements: [
        {
          type: 'link',
          url: commit.url,
          text: commit.message.split('\n')[0],
        },
        {
          type: 'text',
          text: ' by ',
        },
        {
          type: 'link',
          url: commit.committer.url,
          text: commit.committer.name,
        },
      ],
    });
  });

  contentBlock.elements.push(commitListBlock);

  result.push(headerBlock, contentBlock);
  return result;
};

const getHeaderFromSince = (since: SINCE) => {
  switch (since) {
    case SINCE.LAST_DAY:
      return 'What did we get done today?';
    case SINCE.LAST_WEEK:
      return 'What did we get done this week?';
    case SINCE.LAST_MONTH:
      return 'What did we get done this month?';
    default: {
      throw new Error('unsupported type!');
    }
  }
};

const getOperationalSet = async (filePath: string) => {
  const result: OperationalSet = {
    keys: new Set(),
    data: [],
  };
  const fileStream = fs.createReadStream(filePath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    const data = JSON.parse(line) as OperationalSetInput;
    const key = `${data.owner}/${data.repo}/${data.branch}`;
    if (!result.keys.has(key)) {
      result.keys.add(key);
      result.data.push(data);
    }
  }

  return result;
};

export {
  sendStandardResponse,
  snakeCaseToCamelCaseObject,
  getSinceTimestamp,
  getSlackBlocks,
  getHeaderFromSince,
  getOperationalSet,
};
