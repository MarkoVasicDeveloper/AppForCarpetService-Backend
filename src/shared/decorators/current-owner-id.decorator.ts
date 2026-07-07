import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Role } from 'src/shared/enums/role.enum';

export const CurrentOwnerId = createParamDecorator(
  (data: unknown, context: ExecutionContext): number => {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) return 0;

    return user.role === Role.WORKER ? user.userId! : user.id;
  },
);
