import { Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

import { ApiResponse } from '../response/api-response';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      message = typeof res === 'object' && res['message'] ? res['message'] : exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const formattedMessage = Array.isArray(message) ? message.join(', ') : message;

    const errorResponse = new ApiResponse(false, status, formattedMessage, null);

    response.status(status).json(errorResponse);
  }
}
