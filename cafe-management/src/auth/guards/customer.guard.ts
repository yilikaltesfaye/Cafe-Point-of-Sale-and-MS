import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class CustomerGuard implements CanActivate {
  /*
   * Allows access only to active customers.
   */
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const user = request.user;

    /*
     * User must have a customer profile.
     */
    if (!user || !user.customer) {
      throw new ForbiddenException('Customer access required.');
    }

    /*
     * Customer profile must be active.
     */
    if (!user.customer.isActive) {
      throw new ForbiddenException('Customer account inactive.');
    }

    return true;
  }
}
