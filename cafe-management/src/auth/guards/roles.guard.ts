import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '../decorators/roles.decorator';

import { BusinessRole } from 'generated/prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    /*
     * Read required roles
     * from the controller metadata.
     */
    const requiredRoles = this.reflector.getAllAndOverride<BusinessRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    /*
     * No roles specified.
     *
     * Authentication alone is enough.
     */
    if (!requiredRoles) {
      return true;
    }

    /*
     * Get authenticated user
     * from JwtAuthGuard.
     */
    const request = context.switchToHttp().getRequest();

    const user = request.user;

    /*
     * Admin bypass.
     *
     * System administrators have
     * access regardless of employee role.
     */
    if (user.isAdmin) {
      return true;
    }

    /*
     * User must have an employee profile
     * to use business roles.
     */
    if (!user.employee) {
      return false;
    }

    /*
     * Check employee role.
     */
    return requiredRoles.includes(user.employee.role);
  }
}
