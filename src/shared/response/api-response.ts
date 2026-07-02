export class ApiResponse {
  text: string;
  statusCode: number;
  message: string | null;

  constructor(text: string, statusCode: number, message: string | null = null) {
    ((this.text = text), (this.statusCode = statusCode), (this.message = message));
  }
}
