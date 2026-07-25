import { SetMetadata } from '@nestjs/common';
import { BusinessRole } from 'generated/prisma/enums';

// Metadata key used by RolesGuard.
export const ROLES_KEY = 'roles';

// Defines which employee rolescan access a route. Example: @Roles(  BusinessRole.MANAGER,  BusinessRole.OWNER)
export const Roles = (...roles: BusinessRole[]) =>
  SetMetadata(ROLES_KEY, roles);
