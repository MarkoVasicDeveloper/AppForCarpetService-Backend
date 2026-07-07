import {
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  ExceptionFilter,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

import { ApiResponse } from '../response/api-response';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      message = typeof res === 'object' && res['message'] ? res['message'] : exception.message;

      this.logger.warn(
        `Client Error [${status}]: ${Array.isArray(message) ? message.join(', ') : message}`,
      );
    } else {
      if (exception instanceof Error) {
        this.logger.error(`Unhandled Exception: ${exception.message}`, exception.stack);
      } else {
        this.logger.error(`Unhandled Unknown Exception: ${JSON.stringify(exception)}`);
      }
    }

    const formattedMessage = Array.isArray(message) ? message.join(', ') : message;

    const errorResponse = new ApiResponse(false, status, formattedMessage, null);

    response.status(status).json(errorResponse);
  }
}
