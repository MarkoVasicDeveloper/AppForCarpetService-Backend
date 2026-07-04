import { SetMetadata } from '@nestjs/common';

import { Role } from '../enums/role.enum';

export const ROLES_KEY = 'allow_to_roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
