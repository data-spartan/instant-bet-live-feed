export interface ErrorTypeObject {
  status: number;
  message: string;
  stack: string;
}

export interface ErrorResponse {
  statusCode: number;
  message: string;
  path: string;
  method: string;
  stack: string | void;
}
