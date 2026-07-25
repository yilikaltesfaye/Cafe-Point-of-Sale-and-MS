import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { BusinessRole } from 'generated/prisma/enums';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  // Checks whether the authenticated employee has permission by role.
  canActivate(context: ExecutionContext): boolean {
    // Read roles defined by @Roles().
    const requiredRoles = this.reflector.getAllAndOverride<BusinessRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No role requirement. Authentication is enough.
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const user = request.user;

    // System admins bypass business role restrictions.

    if (user?.isAdmin) {
      return true;
    }
    // Only employees have business roles.
    if (!user?.employee) {
      throw new ForbiddenException('Employee role required.');
    }

    // Check employee role.
    const hasRole = requiredRoles.includes(user.employee.role);

    if (!hasRole) {
      throw new ForbiddenException('Insufficient role permissions.');
    }

    return true;
  }
}
