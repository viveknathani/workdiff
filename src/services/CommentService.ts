import { AppState } from '../types';

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
}
