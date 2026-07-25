import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  /*
   * Allows access only to system administrators.
   */
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const user = request.user;

    /*
     * User must be authenticated
     * and have admin privileges.
     */
    if (!user || !user.isAdmin) {
      throw new ForbiddenException('Admin access required.');
    }

    return true;
  }
}
