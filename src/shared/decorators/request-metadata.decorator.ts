import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface RequestMetaData {
  ipAddress: string;
  userAgent: string;
}

export const ExtractRequestMetaData = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestMetaData => {
    const request = ctx.switchToHttp().getRequest();
    return {
      ipAddress: request.ip || '',
      userAgent: request.headers['user-agent'] || '',
    };
  },
);
