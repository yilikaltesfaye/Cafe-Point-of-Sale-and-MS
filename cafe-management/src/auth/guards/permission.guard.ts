import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { Permission } from '../enums/permission.enum';
import { ROLE_PERMISSIONS } from '../constants/role-permissions';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  /*
   * Checks if the user's business role
   * contains the required permissions.
   */
  canActivate(context: ExecutionContext): boolean {
    /*
     * Read required permissions
     * from @Permissions().
     */
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    /*
     * Route has no permission requirement.
     */
    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const user = request.user;

    /*
     * Admin bypass.
     */
    if (user?.isAdmin) {
      return true;
    }

    /*
     * Only employees have
     * business permissions.
     */
    if (!user?.employee) {
      throw new ForbiddenException('Employee access required.');
    }

    const role = user.employee.role;

    /*
     * Get permissions assigned
     * to the employee role.
     */
    const permissions = ROLE_PERMISSIONS[role];

    /*
     * Verify every required permission.
     */
    const hasPermission = requiredPermissions.every((permission) =>
      permissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException('Missing required permission.');
    }

    return true;
  }
}
