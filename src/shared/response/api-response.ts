export class ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string | null;
  data: T | null;

  constructor(
    success: boolean,
    statusCode: number,
    message: string | null = null,
    data: T | null = null,
  ) {
    this.success = success;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}
