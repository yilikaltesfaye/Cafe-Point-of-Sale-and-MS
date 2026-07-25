import { applyDecorators, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../guards/jwt-auth.guard';

import { RolesGuard } from '../guards/roles.guard';

import { Roles } from './roles.decorator';

import { BusinessRole } from 'generated/prisma/enums';

/*
 * Combines authentication
 * and role authorization.
 */
export function Auth(...roles: BusinessRole[]) {
  return applyDecorators(
    /*
     * Requires a valid JWT.
     */
    UseGuards(JwtAuthGuard, RolesGuard),

    /*
     * Restricts access
     * to selected roles.
     */
    Roles(...roles),
  );
}
