import { SetMetadata } from '@nestjs/common';

import { Permission } from '../enums/permission.enum';

/*
 * Metadata key used by PermissionGuard.
 */
export const PERMISSIONS_KEY = 'permissions';

/*
 * Defines required permissions
 * for a route.
 */
export const Permissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
