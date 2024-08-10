import axios from 'axios';
import { AppState, OperationalSetInput, Commit } from '../types';
import { getSinceTimestamp } from '../utils';

export class GetCommitsService {
  private static instance: GetCommitsService;
  private state: AppState;
  private constructor(state: AppState) {
    this.state = state;
  }

  public static getInstance(state: AppState): GetCommitsService {
    if (!GetCommitsService.instance) {
      GetCommitsService.instance = new GetCommitsService(state);
    }
    return GetCommitsService.instance;
  }

  public async fromInput(input: OperationalSetInput): Promise<Commit[]> {
    const sinceTs = getSinceTimestamp(input.since);
    const url =
      `https://api.github.com/repos/${input.owner}/${input.repo}/commits?` +
      'per_page=100' +
      `&since=${sinceTs}`;
    +`&sha=${input.branch}`;
    const token = `${process.env[`GITHUB_TOKEN_${input.owner}`]}`;
    const rawData = await this.getPaginatedData(url, token);
    const result = rawData.map(
      (item: any): Commit => ({
        message: item?.commit?.message,
        url: item?.html_url,
        committer: {
          name: item?.author?.login,
          url: item?.committer?.html_url,
        },
      }),
    );
    return result;
  }

  private async getPaginatedData(url: string, token: string): Promise<any[]> {
    const nextPattern = /(?<=<)([\S]*)(?=>; rel="Next")/i;
    let data: any[] = [];
    let pagesRemaining = true;

    while (pagesRemaining) {
      const response = await axios.get(url, {
        headers: {
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          Authorization: `Bearer ${token}`,
        },
      });
      const parsedData = this.parseData(response.data);
      data = [...data, ...parsedData];
      const linkHeader = response.headers.link;
      // eslint-disable-next-line
      pagesRemaining = linkHeader && linkHeader.includes(`rel=\"next\"`);
      if (pagesRemaining) {
        url = linkHeader.match(nextPattern)[0];
      }
    }

    return data;
  }

  private parseData(data: any) {
    if (Array.isArray(data)) {
      return data;
    }

    // Some endpoints respond with 204 No Content instead of empty array
    //   when there is no data. In that case, return an empty array.
    if (!data) {
      return [];
    }

    // Otherwise, the array of items that we want is in an object
    // Delete keys that don't include the array of items
    delete data.incomplete_results;
    delete data.repository_selection;
    delete data.total_count;

    // Pull out the array of items
    const namespaceKey = Object.keys(data)[0];
    data = data[namespaceKey];

    return data;
  }
}
