import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiResponse } from '../response/api-response';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<unknown>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<unknown>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();

    return next.handle().pipe(
      map((data) => {
        const sanitizedData = instanceToPlain(data);

        return new ApiResponse<unknown>(
          true,
          response.statusCode,
          'Request successful',
          sanitizedData || null,
        );
      }),
    );
  }
}
