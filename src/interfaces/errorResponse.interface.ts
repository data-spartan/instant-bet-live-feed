export interface ErrorResponse {
  statusCode: number;
  message: string;
  path: string;
  method: string;
  stack: string | void;
}
