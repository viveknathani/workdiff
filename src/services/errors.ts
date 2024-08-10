export class ClientError extends Error {}

export class DataValidationError extends ClientError {
  public details: any;
  constructor(message: string, details: any | null = null) {
    super(message);
    this.details = details;
    Object.setPrototypeOf(this, DataValidationError.prototype);
  }
}
