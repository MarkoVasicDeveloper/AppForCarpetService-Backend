import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: ('administrator' | 'user')[]) =>
  SetMetadata('allow_to_roles', roles);
